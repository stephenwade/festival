import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { useTRPC } from '../trpc';

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
