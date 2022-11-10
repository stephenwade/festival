import type { FC, InputHTMLAttributes } from 'react';

type Props = {
  label: string;
  name: string;
  prefix?: string;
  errorMessage?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FC<Props> = ({
  label,
  name,
  prefix,
  errorMessage,
  ...rest
}) => (
  <div className="input-wrapper">
    <label>
      {label}: {prefix}
      <input
        type="text"
        name={name}
        aria-invalid={Boolean(errorMessage) || undefined}
        aria-errormessage={errorMessage ? `${name}-error` : undefined}
        {...rest}
      />
    </label>
    {errorMessage ? (
      <div role="alert" className="input-error-wrapper" id={`${name}-error`}>
        {errorMessage}
      </div>
    ) : null}
  </div>
);
