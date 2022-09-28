import type { SetData } from './ShowData';

type SetInfo = Omit<SetData, 'start'> & {
  start: Date;
  end: Date;
};

export enum TargetStatus {
  WaitingUntilStart = 'WAITING_UNTIL_START',
  Playing = 'PLAYING',
  Ended = 'ENDED',
}

export type TimeInfo =
  | { status: TargetStatus.WaitingUntilStart; secondsUntilSet: number }
  | { status: TargetStatus.Playing; currentTime: number }
  | { status: TargetStatus.Ended };

export type ShowInfo = TimeInfo & {
  currentSet: SetInfo | undefined;
  nextSet: SetInfo | undefined;
};
