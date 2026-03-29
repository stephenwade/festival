import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import spinnerCssHref from './spinner.css?url';

export const Spinner: FC = () => (
  <>
    <Helmet>
      <link rel="stylesheet" href={spinnerCssHref} />
    </Helmet>
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  </>
);
