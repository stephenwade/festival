import type { FC } from 'react';
import { useField } from 'remix-validated-form';

type Props = {
  name: string;
  label: string;
  prefix?: string;
};

export const Input: FC<Props> = ({ name, label, prefix }) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className="input-wrapper">
      <label>
        {label}: {prefix}
        <input
          {...getInputProps()}
          aria-invalid={Boolean(error) || undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
        />
      </label>
      {error ? (
        <div role="alert" className="input-error-wrapper" id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  );
};
