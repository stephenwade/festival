import { useField } from '@rvf/react';
import { useTimezoneSelect } from 'react-timezone-select';

interface InputTimeZoneProps {
  name: string;
  label: string;
}

export function InputTimeZone({ name, label }: InputTimeZoneProps) {
  const field = useField<string>(name);
  const value = field.value();
  const error = field.error();

  const { options, parseTimezone } = useTimezoneSelect({});

  return (
    <div className="input-wrapper">
      <label>
        {label}:{' '}
        <select
          {...field.getInputProps({
            value: parseTimezone(value).value,
            onChange: (e) => {
              field.setValue(parseTimezone(e.currentTarget.value).value);
            },
            'aria-invalid': Boolean(error) || undefined,
            'aria-errormessage': error ? `${name}-error` : undefined,
          })}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <div role="alert" className="input-error-wrapper" id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
