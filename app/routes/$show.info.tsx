import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { formatISO } from 'date-fns';

import type { ShowData } from '~/types/ShowData';

export const loader: LoaderFunction = () => {
  const data: ShowData = {
    name: 'Sample Show',
    description: 'November 8–15, 2023',
    sets: [
      {
        id: 'd4cf8bbe-79ab-4cd8-a319-0ea391f38413',
        audioUrl: 'sample/energy-fix.mp3',
        artist: 'Computer Music All‑stars',
        start: '2020-01-01T00:00:00-0500',
        duration: 181.34,
      },
      {
        id: '53d233eb-8326-4767-995b-10759bb2bd6f',
        audioUrl: 'sample/bust-this-bust-that.mp3',
        artist: 'Professor Kliq',
        start: '2020-01-01T00:03:06-0500',
        duration: 268.64,
      },
      {
        id: '4b4c209f-c26e-4a6e-a2e3-e3c88c6c0958',
        audioUrl: 'sample/one-ride.mp3',
        artist: "'Etikit",
        start: '2020-01-01T00:07:40-0500',
        duration: 183.72,
      },
      {
        id: 'c88d9242-7be4-499c-abe9-ba4f62063ba9',
        audioUrl: 'sample/total-breakdown.mp3',
        artist: 'Brad Sucks',
        start: '2020-01-01T00:10:49-0500',
        duration: 139.0,
      },
      {
        id: '0b2c85e8-9614-471a-a645-b5f44c657c1c',
        audioUrl: 'sample/distant-thunder-sunday-morning.mp3',
        artist: 'springtide',
        start: '2020-01-01T00:13:13-0500',
        duration: 226.06,
      },
    ],
    serverDate: formatISO(new Date()),
  };

  return json(data);
};
