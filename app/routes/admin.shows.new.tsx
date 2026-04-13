import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { NewShowForm } from '../forms/show';

const NewShow: FC = () => {
  return (
    <>
      <Helmet>
        <title>New show | Festival admin</title>
      </Helmet>
      <h3>New show</h3>
      <NewShowForm />
    </>
  );
};

export default NewShow;
