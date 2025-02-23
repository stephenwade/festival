import type { Temporal } from 'temporal-polyfill';

import type { SetData } from './ShowData';

type SetInfo = Omit<SetData, 'start'> & {
  start: Temporal.Instant;
  end: Temporal.Instant;
};

interface SetsInfo {
  currentSet?: SetInfo;
  nextSet?: SetInfo;
}

export type TargetTimeInfo =
  | { status: 'WAITING_UNTIL_START'; secondsUntilSet?: number }
  | { status: 'PLAYING'; currentTime: number; delay?: number }
  | { status: 'ENDED' };

export type TargetShowInfo = TargetTimeInfo & SetsInfo;

type TimeInfo = TargetTimeInfo | { status: 'WAITING_FOR_AUDIO_CONTEXT' };

export type ShowInfo = TimeInfo & SetsInfo;
