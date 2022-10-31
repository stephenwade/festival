import type { Show } from '@prisma/client';
import type {
  LinksFunction,
  LoaderFunction,
  SerializeFrom,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { db } from '~/db/db.server';
import adminStylesUrl from '~/styles/admin.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: adminStylesUrl },
];

type LoaderData = SerializeFrom<Show[]>;

export const loader: LoaderFunction = async () => {
  const shows = await db.show.findMany();

  return json(shows);
};

// export const meta: MetaFunction = ({ data }: { data: ShowData }) => {
//   return {
//     title: `${data.name} | Festival`,
//     description: data.description,
//   };
// };

const Admin: FC = () => {
  const loaderData: LoaderData = useLoaderData();

  return (
    <>
      <h1>Festival admin</h1>
      <h2>Shows</h2>
      <p>
        {loaderData.length === 0 ? (
          <em>No shows yet</em>
        ) : (
          <ul>
            {loaderData.map((show) => (
              <li key={show.id}>{show.name}</li>
            ))}
          </ul>
        )}
      </p>
    </>
  );
};

export default Admin;
