import type { Set, Show } from '@prisma/client';
import type {
  LoaderFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { UploadSets } from '~/components/admin/UploadSets';
import { db } from '~/db/db.server';
import { runPing } from '~/ffmpeg/test.server';
import { useOrigin } from '~/hooks/useOrigin';
import { useSse } from '~/hooks/useSse';

const notFound = () => new Response('Not Found', { status: 404 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

type LoaderData = SerializeFrom<Show & { sets: Set[] }>;

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.show;
  if (!id) throw serverError();

  const show = await db.show.findUnique({
    where: { id },
    include: { sets: true },
  });
  if (!show) throw notFound();

  runPing();

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

  useSse('/admin/test-sse', ['stdout'], (eventName, data) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value += data;
    }
  });

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
      <p>
        <UploadSets showId={show.id} />
      </p>
      <p>
        {show.sets.length === 0 ? (
          <em>No sets yet</em>
        ) : (
          <ul>
            {show.sets.map((set) => (
              <li key={set.id}>{set.artist}</li>
            ))}
          </ul>
        )}
      </p>
      <textarea />
    </>
  );
};

export default ViewShow;
