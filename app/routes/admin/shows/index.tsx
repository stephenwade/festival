import type { Show } from '@prisma/client';
import type { LoaderFunction, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { db } from '~/db/db.server';

type LoaderData = SerializeFrom<Show[]>;

export const loader: LoaderFunction = async () => {
  const shows = await db.show.findMany();

  return json(shows);
};

const ShowIndex: FC = () => {
  const loaderData: LoaderData = useLoaderData();

  return (
    <p>
      {loaderData.length === 0 ? (
        <em>No shows yet</em>
      ) : (
        <ul>
          {loaderData.map((show) => (
            <li key={show.id}>{show.name}</li>
          ))}
        </ul>
      )}
    </p>
  );
};

export default ShowIndex;
