import type { ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import type { FC } from 'react';

import { Input } from '~/components/admin/Input';
import { db } from '~/db/db.server';

function validateShowName(name: string) {
  if (!name.length) {
    return 'Name is required.';
  }
}

async function validateShowSlug(slug: string) {
  if (!slug.length) {
    return 'URL is required.';
  }

  const existingShow = await db.show.findFirst({ where: { slug } });
  if (existingShow) {
    return 'A show already exists with that URL.';
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    slug: string | undefined;
  };
  fields?: {
    name: string;
    slug: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get('name');
  const slug = form.get('slug');
  if (typeof name !== 'string' || typeof slug !== 'string') {
    return badRequest({
      formError: 'Form was not submitted correctly.',
    });
  }

  const fieldErrors = {
    name: validateShowName(name),
    slug: await validateShowSlug(slug),
  };
  const fields = { name, slug };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const show = await db.show.create({ data: fields });
  return redirect(`/shows/${show.slug}`);
};

const NewShow: FC = () => {
  const actionData = useActionData<ActionData>();

  return (
    <>
      <h3>New show</h3>
      <Form method="post">
        <Input
          label="Name"
          name="name"
          required
          defaultValue={actionData?.fields?.name}
          errorMessage={actionData?.fieldErrors?.name}
        />
        <Input
          label="URL"
          prefix="https://urlfest.com/"
          name="slug"
          required
          defaultValue={actionData?.fields?.slug}
          errorMessage={actionData?.fieldErrors?.slug}
        />
        <p>
          <button type="submit" className="button">
            Add
          </button>
        </p>
      </Form>
    </>
  );
};

export default NewShow;
