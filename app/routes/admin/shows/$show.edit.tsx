import type { Show } from '@prisma/client';
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import type { FC } from 'react';
import { ValidatedForm, validationError } from 'remix-validated-form';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { Input } from '~/components/admin/Input';
import { db } from '~/db/db.server';

const schema = zfd.formData({
  name: zfd.text(),
  id: zfd.text(
    z.string().refine((id) => id !== 'new', {
      message: 'Invalid show URL',
    })
  ),
  description: zfd.text(z.string().optional()),
});

const clientValidator = withZod(schema);

const makeServerValidator = ({ previousId }: { previousId: string }) =>
  withZod(
    schema.refine(
      async ({ id }) => {
        if (id === previousId) return true;
        const existingShow = await db.show.findFirst({ where: { id } });
        return !existingShow;
      },
      {
        path: ['id'],
        message: 'A show already exists with that URL.',
      }
    )
  );

const notFound = () => new Response('Not Found', { status: 404 });

type LoaderData = SerializeFrom<Show>;

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.show as string;

  const show = await db.show.findUnique({ where: { id } });
  if (!show) throw notFound();

  return json(show);
};

export const meta: MetaFunction = () => {
  return {
    title: 'Edit show | Festival admin',
  };
};

export const action: ActionFunction = async ({ params, request }) => {
  const previousId = params.show as string;
  const validator = makeServerValidator({ previousId });

  const form = await request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  await db.show.update({
    where: { id: previousId },
    data,
  });
  return redirect(`/admin/shows/${data.id}`);
};

const EditShow: FC = () => {
  const show: LoaderData = useLoaderData();

  return (
    <>
      <h3>Edit show</h3>
      <ValidatedForm
        validator={clientValidator}
        defaultValues={{
          ...show,
          description: show.description ?? undefined,
        }}
        method="post"
      >
        <Input name="name" label="Name" />
        <Input name="id" label="URL" prefix="https://urlfest.com/" />
        <p>
          <Link to={`/admin/shows/${show.id}`}>Cancel</Link>{' '}
          <button type="submit" className="button">
            Save
          </button>
        </p>
      </ValidatedForm>
    </>
  );
};

export default EditShow;
