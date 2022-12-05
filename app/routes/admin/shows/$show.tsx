import { Prisma } from '@prisma/client';
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
import { useOrigin } from '~/hooks/useOrigin';
import { useSse } from '~/hooks/useSse';

const notFound = () => new Response('Not Found', { status: 404 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

const showWithSets = Prisma.validator<Prisma.ShowArgs>()({
  include: { sets: true },
});

type ShowWithSets = Prisma.ShowGetPayload<typeof showWithSets>;

type LoaderData = SerializeFrom<ShowWithSets>;

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.show;
  if (!id) throw serverError();

  const show = await db.show.findUnique({
    where: { id },
    ...showWithSets,
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
      <textarea />
    </>
  );
};

export default ViewShow;
