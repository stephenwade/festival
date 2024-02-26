import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import stylesUrl from '~/styles/show-ended.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

interface ShowEndedProps {
  logoUrl: string;
}

export const ShowEnded: FC<ShowEndedProps> = ({ logoUrl }) => {
  // This will only run once.
  useEffect(() => {
    toast.dismiss();
  }, []);

  return (
    <div className="ended-container full-page">
      <a
        className="logo-link"
        href="https://twitter.com/URLFESTIVAL"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img className="logo" src={logoUrl} />
      </a>
      <a
        href="https://twitter.com/URLFESTIVAL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className="heart" src="/images/heart-white.svg" alt="heart" />
      </a>
    </div>
  );
};
