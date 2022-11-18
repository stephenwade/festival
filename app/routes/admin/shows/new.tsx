import type { ActionFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
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

const serverValidator = withZod(
  schema.refine(
    async ({ id }) => {
      const existingShow = await db.show.findFirst({ where: { id } });
      return !existingShow;
    },
    {
      path: ['id'],
      message: 'A show already exists with that URL.',
    }
  )
);

export const meta: MetaFunction = () => {
  return {
    title: 'New show | Festival admin',
  };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const { data, error } = await serverValidator.validate(form);
  if (error) return validationError(error);

  const show = await db.show.create({ data });
  return redirect(`/admin/shows/${show.id}`);
};

const NewShow: FC = () => {
  return (
    <>
      <h3>New show</h3>
      <ValidatedForm validator={clientValidator} method="post">
        <Input label="Name" name="name" />
        <Input label="URL" prefix="https://urlfest.com/" name="id" />
        <p>
          <button type="submit" className="button">
            Add
          </button>
        </p>
      </ValidatedForm>
    </>
  );
};

export default NewShow;
