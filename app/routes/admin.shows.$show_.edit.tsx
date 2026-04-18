import { useSuspenseQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';

import { EditShowForm } from '../forms/show';
import { useTRPC } from '../trpc';

const EditShow: FC = () => {
  const trpc = useTRPC();
  const id = useParams().show!;

  const { data: show } = useSuspenseQuery(
    trpc.admin.getShowForEditing.queryOptions({ id }),
  );

  return (
    <>
      <title>Edit show | Festival admin</title>
      <h3>Edit show</h3>
      {<EditShowForm defaultValues={show} showId={show.id} />}
    </>
  );
};

export default EditShow;
