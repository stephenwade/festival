import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';

import stylesUrl from './spinner.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export const Spinner: FC = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);
