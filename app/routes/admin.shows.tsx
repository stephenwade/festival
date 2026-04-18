import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

const Shows: FC = () => {
  return (
    <>
      <h2>Shows</h2>
      <Outlet />
    </>
  );
};

export default Shows;
