import type { LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db/db.server';
import { useOrigin } from '~/hooks/useOrigin';

const notFound = () => new Response('Not Found', { status: 404 });

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? `${data.name} | Festival admin` : 'Show | Festival admin' },
];

export const loader = (async (args) => {
  await redirectToLogin(args);

  const id = args.params.show as string;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      showLogoFile: true,
      backgroundImageFile: true,
      sets: {
        include: {
          audioFileUpload: { select: { audioFile: true } },
        },
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
        <strong>URL:</strong> {origin}/{show.id}
      </p>
      <p>
        <strong>Description:</strong> {show.description}
      </p>
      <p>
        <strong>Start date:</strong> {show.startDate}
      </p>
      <p>
        <strong>Show logo:</strong>{' '}
        <a href={show.showLogoFile.url}>{show.showLogoFile.name}</a>
      </p>
      <p>
        <strong>Background image:</strong>{' '}
        <a href={show.backgroundImageFile.url}>
          {show.backgroundImageFile.name}
        </a>
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
              {set.artist || <em>No artist yet</em>}
              <ul>
                <li>
                  <strong>Offset:</strong> {set.offset}
                </li>
                <li>
                  <strong>Duration:</strong>{' '}
                  {set.audioFileUpload?.audioFile?.duration ?? <em>Unknown</em>}
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
