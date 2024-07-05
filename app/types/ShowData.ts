export interface SetData {
  id: string;
  audioUrl: string;
  artist: string;
  start: string;
  duration: number;
}

export interface ShowData {
  name: string;
  slug: string;
  description: string;
  showLogoUrl: string;
  backgroundImageUrl: string;
  sets: SetData[];
  serverDate: string;
}
