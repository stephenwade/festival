import type { FC } from 'react';

import { NewShowForm } from '../forms/show';

const NewShow: FC = () => {
  return (
    <>
      <title>New show | Festival admin</title>
      <h3>New show</h3>
      <NewShowForm />
    </>
  );
};

export default NewShow;
