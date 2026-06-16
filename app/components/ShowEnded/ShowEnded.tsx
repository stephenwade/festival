import { useEffect } from 'react';
import { toast } from 'react-toastify';

import type { ShowData } from '../../../server/types/ShowData';
import showEndedCssHref from '../../styles/show-ended.css?url';

interface ShowEndedProps {
  showData: ShowData;
}

export function ShowEnded({ showData }: ShowEndedProps) {
  // This will only run once.
  useEffect(() => {
    toast.dismiss();
  }, []);

  return (
    <>
      <link rel="stylesheet" precedence="any" href={showEndedCssHref} />
      <div className="ended-container full-page">
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
        <a
          href="https://twitter.com/URLFESTIVAL"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="heart" src="/images/heart-white.svg" alt="heart" />
        </a>
      </div>
    </>
  );
}
