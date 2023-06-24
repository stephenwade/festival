import { formatInTimeZone } from 'date-fns-tz';
import type { ComponentProps, FC } from 'react';
import { useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import type { InputProps } from './Input';

type Props = InputProps & {
  step: ComponentProps<'input'>['step'];
};

export const InputDateTime: FC<Props> = ({ name, label, prefix, ...rest }) => {
  const { error } = useField(name);
  const [utcValue, setUtcValue] = useControlField<string>(name);

  const [inputValue, setInputValue] = useState(utcToLocalDateTime(utcValue));

  return (
    <div className="input-wrapper">
      <input type="hidden" name={name} value={utcValue} />
      <label>
        {label}: {prefix}
        <input
          {...rest}
          type="datetime-local"
          aria-invalid={Boolean(error) || undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          value={inputValue}
          onChange={({ target: { value } }) => {
            setInputValue(value);
            setUtcValue(localDateTimeToUtc(value));
            console.log(localDateTimeToUtc(value));
          }}
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

function localDateTimeToUtc(localDateTime: string): string {
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString();
}

function utcToLocalDateTime(utcDateTime: string): string {
  const date = new Date(utcDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ss");
}
