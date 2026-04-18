import { useSuspenseQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { Navigate } from 'react-router-dom';

import indexCssHref from '../styles/index.css?url';
import showCssHref from '../styles/show.css?url';
import { useTRPC } from '../trpc';

const Index: FC = () => {
  const trpc = useTRPC();

  const { data: indexShowSlug } = useSuspenseQuery(
    trpc.show.getIndexShowSlug.queryOptions(),
  );

  if (indexShowSlug) {
    return <Navigate to={`/${indexShowSlug}`} />;
  }

  return (
    <>
      <title>Festival</title>
      <link rel="stylesheet" precedence="any" href={showCssHref} />
      <link rel="stylesheet" precedence="any" href={indexCssHref} />
      <div className="index-container full-page">
        <img className="logo" src="/images/festival.svg" alt="FESTIVAL" />
        <div className="attribution">
          Photo by <a href="https://unsplash.com/@yvettedewit">Yvette de Wit</a>{' '}
          on{' '}
          <a href="https://unsplash.com/photos/group-of-people-attending-a-performance-8XLapfNMW04">
            Unsplash
          </a>
        </div>
      </div>
    </>
  );
};

export default Index;
