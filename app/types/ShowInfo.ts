import type { SetData } from './ShowData';

type SetInfo = Omit<SetData, 'start'> & {
  start: Date;
  end: Date;
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

export type TimeInfo = TargetTimeInfo | { status: 'WAITING_FOR_AUDIO_CONTEXT' };

export type ShowInfo = TimeInfo & SetsInfo;
