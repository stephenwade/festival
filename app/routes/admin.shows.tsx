import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

const Shows: FC = () => {
  return (
    <>
      <Helmet>
        <title>Shows | Festival admin</title>
      </Helmet>
      <h2>Shows</h2>
      <Outlet />
    </>
  );
};

export default Shows;
