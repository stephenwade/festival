import type { MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';

export const meta: MetaFunction = () => {
  return {
    title: 'Shows | Festival admin',
  };
};

const Shows: FC = () => {
  return (
    <>
      <h2>Shows</h2>
      <Outlet />
    </>
  );
};

export default Shows;
