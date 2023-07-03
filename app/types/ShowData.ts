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
  showLogoUrl: string;
  backgroundImageUrl: string;
  sets: SetData[];
  serverDate: string;
};
