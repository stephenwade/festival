import type { V2_MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';

export const meta: V2_MetaFunction = () => [
  { title: 'Shows | Festival admin' },
];

const Shows: FC = () => {
  return (
    <>
      <h2>Shows</h2>
      <Outlet />
    </>
  );
};

export default Shows;
