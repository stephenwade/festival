import { Prisma } from '@prisma/client';
import type {
  LoaderFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback } from 'react';

import { UploadSets } from '~/components/admin/UploadSets';
import { db } from '~/db/db.server';
import { useOrigin } from '~/hooks/useOrigin';
import { useSse } from '~/hooks/useSse';
import type {
  FileProcessingFileUpdateData,
  FileProcessingNewSetData,
  FileProcessingSetUpdateData,
} from '~/types/admin/file-processing-events';
import { FileProcessingEventNames } from '~/types/admin/file-processing-events';

const notFound = () => new Response('Not Found', { status: 404 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

const showWithSetsAndFiles = Prisma.validator<Prisma.ShowArgs>()({
  include: {
    sets: {
      include: { file: true },
    },
  },
});

type ShowWithSetsAndFiles = Prisma.ShowGetPayload<typeof showWithSetsAndFiles>;

type LoaderData = SerializeFrom<ShowWithSetsAndFiles>;

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.show;
  if (!id) throw serverError();

  const show = await db.show.findUnique({
    where: { id },
    ...showWithSetsAndFiles,
  });
  if (!show) throw notFound();

  return json(show);
};

export const meta: MetaFunction = ({ data }) => {
  const loaderData = data as LoaderData;

  return {
    title: `${loaderData.name} | Festival admin`,
  };
};

const ViewShow: FC = () => {
  const show: LoaderData = useLoaderData();

  const origin = useOrigin();

  useSse(
    '/admin/shows/file-processing-sse',
    FileProcessingEventNames,
    useCallback((eventName, data) => {
      if (eventName === 'new set') {
        const newSet = data as FileProcessingNewSetData;
        console.log('new set', newSet);
      } else if (eventName === 'set update') {
        const setUpdate = data as FileProcessingSetUpdateData;
        console.log('set update', setUpdate);
      } else if (eventName === 'file update') {
        const fileUpdate = data as FileProcessingFileUpdateData;
        console.log('file update', fileUpdate);
      }
    }, [])
  );

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
      <h3>Sets</h3>
      <UploadSets showId={show.id} />
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
                  <strong>Valid?</strong> {set.isValid ? 'yes' : 'no'}
                </li>
                <li>
                  <strong>Start:</strong> {set.start ?? <em>No start yet</em>}
                </li>
                <li>
                  <strong>Duration:</strong>{' '}
                  {set.duration ?? <em>Calculating…</em>}
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