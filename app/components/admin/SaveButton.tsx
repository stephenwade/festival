import type { FC, ReactNode } from 'react';
import { useFormContext, useIsSubmitting } from 'remix-validated-form';

interface SaveButtonProps {
  text?: ReactNode;
  textSubmitting?: ReactNode;
  disabled?: boolean;
}

export const SaveButton: FC<SaveButtonProps> = ({
  text = 'Save',
  textSubmitting = 'Saving…',
  disabled: disabledProp,
}) => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const disabled = disabledProp || isSubmitting || !isValid;

  return (
    <button type="submit" disabled={disabled}>
      {isSubmitting ? textSubmitting : text}
    </button>
  );
};
