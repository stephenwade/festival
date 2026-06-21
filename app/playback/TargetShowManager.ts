import { Temporal } from 'temporal-polyfill';

import type { SetData, ShowData } from '../../server/types/ShowData';
import type {
  TargetShowInfo,
  TargetTimeInfo,
} from '../../server/types/ShowInfo';
import type { AudioMetadata } from './AudioManager';
import { type Listener, ListenerSet, type Unsubscribe } from './ListenerSet';

type GetShowData = () => Promise<ShowData>;

function isBefore(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) === -1;
}

export class TargetShowManager {
  private showData: ShowData;
  private clientTimeSkewMs = 0;
  private sets: (Omit<SetData, 'start'> & {
    start: Temporal.Instant;
    end: Temporal.Instant;
  })[] = [];
  private targetShowInfo_: TargetShowInfo = { status: 'ENDED' };

  private audioDurations: Record<string, number> = {};

  private readonly refetchInterval: NodeJS.Timeout;
  private isFetching = false;

  private readonly clockInterval?: NodeJS.Timeout;

  private readonly targetShowInfoListeners = new ListenerSet<TargetShowInfo>();

  getShowData: GetShowData;

  constructor(
    showData: ShowData,
    getShowData: GetShowData,
    { ci = false, enableClock = true } = {},
  ) {
    this.showData = showData;
    this.getShowData = getShowData;
    this.updateClientTimeSkewMs();
    this.updateSets();

    const SECONDS = 1000;
    this.refetchInterval = setInterval(
      () => {
        if (!this.isFetching) {
          void this.fetch();
        }
      },
      ci ? 3 * SECONDS : 60 * SECONDS,
    );

    if (enableClock) {
      let currentSecond = 0;
      this.clockInterval = setInterval(() => {
        const lastSecond = currentSecond;
        currentSecond = Math.floor(
          Temporal.Now.instant().epochMilliseconds / 1000,
        );
        if (lastSecond !== currentSecond) {
          this.updateTargetShowInfo();
        }
      }, 200);
    }
  }

  private async fetch() {
    try {
      this.isFetching = true;

      this.showData = await this.getShowData();

      this.updateClientTimeSkewMs();
      this.updateSets();
    } catch {
      // ignore errors
    } finally {
      this.isFetching = false;
    }
  }

  private updateClientTimeSkewMs() {
    const serverDate = Temporal.Instant.from(this.showData.serverDate);
    // `.add()` requires integers
    this.clientTimeSkewMs = Math.round(
      serverDate.until(Temporal.Now.instant()).total({ unit: 'milliseconds' }),
    );
  }

  private updateSets() {
    const result: typeof this.sets = [];

    for (const set of this.showData.sets) {
      const start = Temporal.Instant.from(set.start).add({
        milliseconds: this.clientTimeSkewMs,
      });

      const length = this.audioDurations[set.id] ?? set.duration;
      const end = start
        .add({
          // `.add()` requires integers
          // seconds: length,
          milliseconds: Math.round(length * 1000),
        })
        .add({ milliseconds: this.clientTimeSkewMs });

      result.push({ ...set, start, end });
    }

    this.sets = result;

    this.updateTargetShowInfo();
  }

  private updateTargetShowInfo() {
    const currentSetIndex = this.sets.findIndex((set) =>
      isBefore(Temporal.Now.instant(), set.end),
    );
    const currentSet =
      currentSetIndex === -1 ? undefined : this.sets[currentSetIndex];
    const nextSet =
      currentSetIndex === -1 ? undefined : this.sets[currentSetIndex + 1];

    const timeInfo: TargetTimeInfo = currentSet
      ? isBefore(Temporal.Now.instant(), currentSet.start)
        ? {
            status: 'WAITING_UNTIL_START',
            secondsUntilSet: Math.ceil(
              Temporal.Now.instant()
                .until(currentSet.start)
                .total({ unit: 'seconds' }),
            ),
          }
        : {
            status: 'PLAYING',
            currentTime: Math.floor(
              currentSet.start
                .until(Temporal.Now.instant())
                .total({ unit: 'seconds' }),
            ),
          }
      : { status: 'ENDED' };

    const targetShowInfo: TargetShowInfo = { ...timeInfo, currentSet, nextSet };

    this.targetShowInfo_ = targetShowInfo;
    this.targetShowInfoListeners.emit(this.targetShowInfo);

    if (timeInfo.status === 'ENDED') {
      clearInterval(this.clockInterval);
    }
  }

  get targetShowInfo(): Readonly<typeof this.targetShowInfo_> {
    return this.targetShowInfo_;
  }

  addTargetShowInfoListener(listener: Listener<TargetShowInfo>): Unsubscribe {
    return this.targetShowInfoListeners.subscribe(listener);
  }

  onLoadedMetadata(metadata: AudioMetadata) {
    this.audioDurations[metadata.setId] = metadata.duration;

    this.updateSets();
  }

  dispose() {
    this.targetShowInfoListeners.clear();

    clearInterval(this.refetchInterval);
    clearInterval(this.clockInterval);
  }
}
