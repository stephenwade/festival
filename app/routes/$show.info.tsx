import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { formatISO } from 'date-fns';

import type { ShowData } from '~/types/ShowData';

export const loader = (() => {
  const data: ShowData = {
    name: 'Sample Show',
    description: 'November 8–15, 2023',
    sets: [
      {
        id: 'd4cf8bbe-79ab-4cd8-a319-0ea391f38413',
        audioUrl: '/media/sample/energy-fix.mp3',
        artist: 'Computer Music All‑stars',
        start: '2022-10-17T23:20:00-0400',
        duration: 181.34,
      },
      {
        id: '53d233eb-8326-4767-995b-10759bb2bd6f',
        audioUrl: '/media/sample/bust-this-bust-that.mp3',
        artist: 'Professor Kliq',
        start: '2022-10-17T23:23:06-0400',
        duration: 268.64,
      },
      {
        id: '4b4c209f-c26e-4a6e-a2e3-e3c88c6c0958',
        audioUrl: '/media/sample/one-ride.mp3',
        artist: "'Etikit",
        start: '2022-10-17T23:27:40-0400',
        duration: 183.72,
      },
      {
        id: 'c88d9242-7be4-499c-abe9-ba4f62063ba9',
        audioUrl: '/media/sample/total-breakdown.mp3',
        artist: 'Brad Sucks',
        start: '2022-10-17T23:30:49-0400',
        duration: 139,
      },
      {
        id: '0b2c85e8-9614-471a-a645-b5f44c657c1c',
        audioUrl: '/media/sample/distant-thunder-sunday-morning.mp3',
        artist: 'springtide',
        start: '2022-10-17T23:33:13-0400',
        duration: 226.06,
      },
    ],
    serverDate: formatISO(new Date()),
  };

  return json(data);
}) satisfies LoaderFunction;
