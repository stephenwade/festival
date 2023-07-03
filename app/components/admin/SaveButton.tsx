import type { FC, ReactNode } from 'react';
import { useFormContext, useIsSubmitting } from 'remix-validated-form';

type Props = {
  text?: ReactNode;
  textSubmitting?: ReactNode;
  disabled?: boolean;
};

export const SaveButton: FC<Props> = ({
  text = 'Save',
  textSubmitting = 'Saving…',
  disabled: disabledProp,
}) => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  const disabled = disabledProp || isSubmitting || !isValid;

  return (
    <button type="submit" disabled={disabled}>
      {isSubmitting ? textSubmitting : text}
    </button>
  );
};
