import type { FC, ReactNode } from 'react';
import { useIsSubmitting } from 'remix-validated-form';

type Props = {
  text: ReactNode;
  textSubmitting: ReactNode;
};

export const SubmitButton: FC<Props> = ({ text, textSubmitting }) => {
  const isSubmitting = useIsSubmitting();

  return (
    <button type="submit" className="button" disabled={isSubmitting}>
      {isSubmitting ? textSubmitting : text}
    </button>
  );
};
