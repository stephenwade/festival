import type { FC } from 'react';
import { useField } from 'remix-validated-form';

interface InputProps {
  name: string;
  type?: 'color' | 'datetime-local';
  step?: string;
  label: string;
  prefix?: string;
}

export const Input: FC<InputProps> = ({ name, type, step, label, prefix }) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className="input-wrapper">
      <label>
        {label}: {prefix}
        <input
          {...getInputProps({
            type,
            step,
            'aria-invalid': Boolean(error) || undefined,
            'aria-errormessage': error ? `${name}-error` : undefined,
          })}
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
