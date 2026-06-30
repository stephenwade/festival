import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { useTRPC } from '../trpc';

export default function ShowsIndex() {
  const trpc = useTRPC();

  const { data: shows } = useSuspenseQuery(trpc.admin.getShows.queryOptions());

  return (
    <>
      <title>Shows | Festival admin</title>
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
}
