import type { FC } from 'react';

import spinnerCssHref from './spinner.css?url';

export const Spinner: FC = () => (
  <>
    <link rel="stylesheet" precedence="any" href={spinnerCssHref} />
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  </>
);
