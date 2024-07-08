import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';
import { Temporal } from 'temporal-polyfill';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';
import { useOrigin } from '~/hooks/useOrigin';
import { notFound } from '~/utils.server/responses';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? `${data.name} | Festival admin` : 'Show | Festival admin' },
];

export const loader = (async (args) => {
  await redirectToLogin(args);

  const id = args.params.show!;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      logoImageFile: true,
      backgroundImageFile: true,
      sets: {
        include: { audioFile: true },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw notFound();

  return json(show);
}) satisfies LoaderFunction;

const ViewShow: FC = () => {
  const show = useLoaderData<typeof loader>();

  const origin = useOrigin();

  return (
    <>
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
