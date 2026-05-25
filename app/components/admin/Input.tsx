import { useField } from '@rvf/react';

interface InputProps {
  name: string;
  type?: 'color' | 'datetime-local';
  step?: string;
  label: string;
  prefix?: string;
}

export function Input({ name, type, step, label, prefix }: InputProps) {
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
}
