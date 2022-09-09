import type { LinksFunction } from '@remix-run/node';
import { useState } from 'react';

import stylesUrl from '../styles/show.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export default function Show() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <div className="container">
      <a
        className="logo-link"
        href="https://twitter.com/URLFESTIVAL"
        target="_blank"
        rel="noopener noreferrer"
        hidden={!logoLoaded}
      >
        <img
          className="logo"
          src="/images/impulse-logo.png"
          alt="Impulse Music Festival"
          onLoad={() => {
            setLogoLoaded(true);
          }}
        />
      </a>
      <div className="buttons" hidden={!logoLoaded}>
        <span className="elevation-z2">
          <button /*@click="${this._handleListenClicked}"*/>Listen Live</button>
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
}
