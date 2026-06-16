import type { ShowData } from '../../../server/types/ShowData';
import { useInitializeAudio } from '../../playback';
import showIntroCssHref from '../../styles/show-intro.css?url';

interface ShowIntroProps {
  showData: ShowData;
}

export function ShowIntro({ showData }: ShowIntroProps) {
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
          <img
            className="logo"
            src={showData.showLogoUrl}
            alt={showData.name}
          />
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
}
