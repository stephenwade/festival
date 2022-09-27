type SetData = {
  id: string;
  audioUrl: string;
  artist: string;
  start: string;
  duration: number;
};

export type ShowData = {
  name: string;
  description: string;
  sets: SetData[];
};

type SetStatus = Omit<SetData, 'start'> & {
  start: Date;
  end: Date;
};

export type ShowStatus = Omit<ShowData, 'sets'> & {
  sets: SetStatus[];
  onLoadedMetadata: (params: { audioUrl: string; duration: number }) => void;
};
