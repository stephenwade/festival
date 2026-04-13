import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Temporal } from 'temporal-polyfill';

import { useOrigin } from '../hooks/useOrigin';
import { useTRPC } from '../trpc';

const ViewShow: FC = () => {
  const trpc = useTRPC();
  const id = useParams().show!;

  const { data: show } = useQuery(trpc.admin.getShow.queryOptions({ id }));

  const origin = useOrigin();

  if (!show) return null;

  return (
    <>
      <Helmet>
        <title>{show.name} | Festival admin</title>
      </Helmet>
      <p>
        <Link to="/admin/shows">Back to all shows</Link> -{' '}
        <Link to={`/admin/shows/${show.id}/edit`}>Edit</Link>
      </p>
      <p>
        <strong>Name:</strong> {show.name}
      </p>
      <p>
        <strong>URL:</strong> {origin}/{show.slug}
      </p>
      <p>
        <strong>Description:</strong>{' '}
        {show.description ?? <em>No description yet</em>}
      </p>
      <p>
        <strong>Start date:</strong>{' '}
        {show.startDate ? (
          Temporal.Instant.from(show.startDate)
            .toZonedDateTimeISO(show.timeZone)
            .toLocaleString()
        ) : (
          <em>No start date yet</em>
        )}
      </p>
      <p>
        <strong>Logo image:</strong>{' '}
        {show.logoImageFile ? (
          <a href={show.logoImageFile.url}>{show.logoImageFile.name}</a>
        ) : (
          <em>No logo image yet</em>
        )}
      </p>
      <p>
        <strong>Background image:</strong>{' '}
        {show.backgroundImageFile ? (
          <a href={show.backgroundImageFile.url}>
            {show.backgroundImageFile.name}
          </a>
        ) : (
          <em>No background image yet</em>
        )}
      </p>
      <p>
        <strong>Background colors:</strong> {show.backgroundColor},{' '}
        {show.backgroundColorSecondary}
      </p>
      <h3>Sets</h3>
      {show.sets.length === 0 ? (
        <p>
          <em>No sets yet</em>
        </p>
      ) : (
        <ul>
          {show.sets.map((set) => (
            <li key={set.id}>
              {set.artist ?? <em>No artist yet</em>}
              <ul>
                <li>
                  <strong>Offset:</strong>{' '}
                  {set.offset ?? <em>No offset yet</em>}
                </li>
                <li>
                  <strong>Duration:</strong>{' '}
                  {set.audioFile?.duration ?? <em>Unknown</em>}
                </li>
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ViewShow;
