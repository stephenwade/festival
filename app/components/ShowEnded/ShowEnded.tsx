import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';
import { toast } from 'react-toastify';
import { useEffectOnce } from 'usehooks-ts';

import stylesUrl from '~/styles/show-ended.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

interface Props {
  logoUrl: string;
}

export const ShowEnded: FC<Props> = ({ logoUrl }) => {
  useEffectOnce(() => {
    toast.dismiss();
  });

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
