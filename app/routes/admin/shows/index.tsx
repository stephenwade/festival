import type { Show } from '@prisma/client';
import type { LoaderFunction, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
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
    <>
      <p>
        {loaderData.length === 0 ? (
          <em>No shows yet</em>
        ) : (
          <ul>
            {loaderData.map((show) => (
              <li key={show.id}>
                <Link to={`/admin/shows/${show.id}`}>
                  {show.name} ({show.slug})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </p>
      <p>
        <Link to="/admin/shows/new">Add show</Link>
      </p>
    </>
  );
};

export default ShowIndex;
