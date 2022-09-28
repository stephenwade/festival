export type SetData = {
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
  serverDate: string;
};
