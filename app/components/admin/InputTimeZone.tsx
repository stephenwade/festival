import type { FC } from 'react';
import { useTimezoneSelect } from 'react-timezone-select';
import { useControlField, useField } from 'remix-validated-form';

export interface InputTimeZoneProps {
  name: string;
  label: string;
}

type Props = InputTimeZoneProps;

export const InputTimeZone: FC<Props> = ({ name, label }) => {
  const { error, getInputProps } = useField(name);
  const [value, setValue] = useControlField<string>(name);

  const { options, parseTimezone } = useTimezoneSelect({});

  return (
    <div className="input-wrapper">
      <label>
        {label}:{' '}
        <select
          {...getInputProps({
            value: parseTimezone(value).value,
            onChange: (e) => {
              setValue(parseTimezone(e.currentTarget.value).value);
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
};
