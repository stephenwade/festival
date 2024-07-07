import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';
import { showIncludeData } from '~/types/ShowWithData';
import { validateShow } from '~/types/validateShow';

const omit = <T extends object, TKey extends keyof T>(
  item: T,
  keys: TKey[],
): Omit<T, TKey> => {
  const result = { ...item };
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete result[key];
  }
  return result;
};

export const loader = (async (args) => {
  await redirectToLogin(args);

  const shows = await db.show.findMany({
    include: showIncludeData,
  });

  return json(
    shows.map((show) => ({
      ...omit(
        show,
        Object.keys(showIncludeData) as (keyof typeof showIncludeData)[],
      ),
      isValid: validateShow(show),
    })),
  );
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
              {show.isValid ? '✅' : '❌'}{' '}
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
