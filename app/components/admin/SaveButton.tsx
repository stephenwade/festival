import { useFormContext } from '@rvf/remix';
import type { FC, ReactNode } from 'react';

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
  const {
    formState: { isSubmitting, isValid },
  } = useFormContext();
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const disabled = disabledProp || isSubmitting || !isValid;

  return (
    <button type="submit" disabled={disabled}>
      {isSubmitting ? textSubmitting : text}
    </button>
  );
};
