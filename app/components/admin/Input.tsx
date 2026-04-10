import { useField } from '@rvf/remix';
import type { FC } from 'react';

interface InputProps {
  name: string;
  type?: 'color' | 'datetime-local';
  step?: string;
  label: string;
  prefix?: string;
}

export const Input: FC<InputProps> = ({ name, type, step, label, prefix }) => {
  const field = useField(name);
  const error = field.error();

  return (
    <div className="input-wrapper">
      <label>
        {label}: {prefix}
        <input
          {...field.getInputProps({
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
