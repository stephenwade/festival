import type { FC, ReactNode } from 'react';
import { useFormContext, useIsSubmitting } from 'remix-validated-form';

type Props = {
  text: ReactNode;
  textSubmitting: ReactNode;
};

export const SubmitButton: FC<Props> = ({ text, textSubmitting }) => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  const disabled = isSubmitting || !isValid;

  return (
    <button type="submit" className="button" disabled={disabled}>
      {isSubmitting ? textSubmitting : text}
    </button>
  );
};
