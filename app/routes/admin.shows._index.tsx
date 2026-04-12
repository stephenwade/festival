import type { LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { redirectToLogin } from '../auth/redirect-to-login.server';
import { useTRPC } from '../trpc';

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

const ShowsIndex: FC = () => {
  const trpc = useTRPC();

  const { data: shows } = useQuery(trpc.admin.getShows.queryOptions());

  return (
    <>
      {!shows || shows.length === 0 ? (
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
