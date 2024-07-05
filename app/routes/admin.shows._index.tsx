import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';

export const loader = (async (args) => {
  await redirectToLogin(args);

  const shows = await db.show.findMany();

  return json(shows);
}) satisfies LoaderFunction;

const ShowsIndex: FC = () => {
  const shows = useLoaderData<typeof loader>();

  return (
    <>
      {shows.length === 0 ? (
        <p>
          <em>No shows yet</em>
        </p>
      ) : (
        <ul>
          {shows.map((show) => (
            <li key={show.id}>
              <Link to={`/admin/shows/${show.id}`}>
                {show.name} ({show.slug})
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link to="/admin/shows/new">Add show</Link>
      </p>
    </>
  );
};

export default ShowsIndex;
