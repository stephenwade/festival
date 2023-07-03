import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';

import stylesUrl from '~/styles/show-intro.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

type Props = {
  logoUrl: string;
  onListenClicked: () => void;
};

export const ShowIntro: FC<Props> = ({ logoUrl, onListenClicked }) => {
  return (
    <div className="intro-container">
      <a
        className="logo-link"
        href="https://twitter.com/URLFESTIVAL"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img className="logo" src={logoUrl} />
      </a>
      <div className="buttons">
        <span className="elevation-z2">
          <button onClick={onListenClicked}>Listen Live</button>
        </span>
        <span className="elevation-z2">
          <a
            href="https://discord.io/festival"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </a>
        </span>
      </div>
    </div>
  );
};