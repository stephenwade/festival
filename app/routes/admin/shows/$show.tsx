import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { db } from '~/db/db.server';
import { useOrigin } from '~/hooks/useOrigin';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async ({ params }) => {
  const id = params.show as string;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      sets: {
        include: {
          fileUpload: { select: { file: true } },
        },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw notFound();

  return json(show);
}) satisfies LoaderFunction;

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `${data.name} | Festival admin`,
  };
};

const ViewShow: FC = () => {
  const show = useLoaderData<typeof loader>();

  const origin = useOrigin();

  // useSse(
  //   '/admin/file-uploads/events',
  //   FileProcessingEventNames,
  //   useCallback((eventName, data) => {
  //     if (eventName === 'new set') {
  //       const newSet = data as FileProcessingNewSetData;
  //       console.log('new set', newSet);
  //     } else if (eventName === 'set update') {
  //       const setUpdate = data as FileProcessingSetUpdateData;
  //       console.log('set update', setUpdate);
  //     } else if (eventName === 'file update') {
  //       const fileUpdate = data as FileProcessingFileUpdateData;
  //       console.log('file update', fileUpdate);
  //     }
  //   }, [])
  // );

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
                  {set.fileUpload?.file?.duration ?? <em>Unknown</em>}
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
