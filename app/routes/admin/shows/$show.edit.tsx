import type { Show } from '@prisma/client';
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { Input } from '~/components/admin/Input';
import { db } from '~/db/db.server';

function validateShowName(name: string) {
  if (!name.length) {
    return 'Name is required.';
  }
}

async function validateShowId(id: string, previousId: string) {
  if (!id.length) {
    return 'URL is required.';
  }

  if (id === previousId) return;

  if (id === 'new') {
    return 'Invalid show URL.';
  }

  const existingShow = await db.show.findFirst({ where: { id } });
  if (existingShow) {
    return 'A show already exists with that URL.';
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    id: string | undefined;
  };
  fields?: {
    name: string;
    id: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
const notFound = () => new Response('Not Found', { status: 404 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

type LoaderData = SerializeFrom<Show>;

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.show;
  if (!id) throw serverError();

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
  const form = await request.formData();
  const name = form.get('name');
  const id = form.get('id');
  if (typeof name !== 'string' || typeof id !== 'string') {
    return badRequest({
      formError: 'Form was not submitted correctly.',
    });
  }

  const previousId = params.show;
  if (!previousId) throw serverError();
  const fieldErrors = {
    name: validateShowName(name),
    id: await validateShowId(id, previousId),
  };
  const fields = { name, id };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  await db.show.update({
    where: { id: previousId },
    data: fields,
  });
  return redirect(`/admin/shows/${fields.id}`);
};

const EditShow: FC = () => {
  const loaderData: LoaderData = useLoaderData();
  const actionData = useActionData<ActionData>();

  return (
    <>
      <h3>Edit show</h3>
      <Form method="post">
        <Input
          label="Name"
          name="name"
          required
          defaultValue={actionData?.fields?.name || loaderData.name}
          errorMessage={actionData?.fieldErrors?.name}
        />
        <Input
          label="URL"
          prefix="https://urlfest.com/"
          name="id"
          required
          defaultValue={actionData?.fields?.id || loaderData.id}
          errorMessage={actionData?.fieldErrors?.id}
        />
        <p>
          <Link to={`/admin/shows/${loaderData.id}`}>Cancel</Link>{' '}
          <button type="submit" className="button">
            Save
          </button>
        </p>
      </Form>
    </>
  );
};

export default EditShow;
