import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { EditShowForm } from '../forms/show';
import { useTRPC } from '../trpc';

function EditShow() {
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
}

export default EditShow;
