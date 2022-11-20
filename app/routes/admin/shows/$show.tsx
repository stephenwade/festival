import type { Show } from '@prisma/client';
import type {
  LoaderFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { db } from '~/db/db.server';

const notFound = () => new Response('Not Found', { status: 404 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

type LoaderData = SerializeFrom<Show>;

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.show;
  if (!id) throw serverError();

  const show = await db.show.findUnique({ where: { id } });
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
  const loaderData: LoaderData = useLoaderData();

  return (
    <>
      <p>
        <Link to="/admin/shows">Back to all shows</Link> -{' '}
        <Link to={`/admin/shows/${loaderData.id}/edit`}>Edit</Link>
      </p>
      <p>
        <strong>Name:</strong> {loaderData.name}
      </p>
      <p>
        <strong>URL:</strong> https://urlfest.com/{loaderData.id}
      </p>
      <p>
        <strong>Description:</strong> {loaderData.description}
      </p>
    </>
  );
};

export default ViewShow;
