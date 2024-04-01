import '~/styles/show-intro.css';

import type { FC } from 'react';

interface ShowIntroProps {
  logoUrl: string;
  onListenClicked: () => void;
}

export const ShowIntro: FC<ShowIntroProps> = ({ logoUrl, onListenClicked }) => {
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
          <button onClick={onListenClicked}>LISTEN LIVE</button>
        </span>
        <span className="elevation-z2">
          <a
            href="https://discord.gg/8dFvsGV"
            target="_blank"
            rel="noopener noreferrer"
          >
            JOIN DISCORD
          </a>
        </span>
      </div>
    </div>
  );
};
