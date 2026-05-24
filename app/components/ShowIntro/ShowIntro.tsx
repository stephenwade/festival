import type { FC } from 'react';

import { useInitializeAudio } from '../../playback';
import showIntroCssHref from '../../styles/show-intro.css?url';

interface ShowIntroProps {
  logoUrl: string;
}

export const ShowIntro: FC<ShowIntroProps> = ({ logoUrl }) => {
  const initializeAudio = useInitializeAudio();

  return (
    <>
      <link rel="stylesheet" precedence="any" href={showIntroCssHref} />
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
            <button onClick={initializeAudio}>LISTEN LIVE</button>
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
    </>
  );
};
