import { useQueries } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { ShowDisplay } from '../components/ShowDisplay';
import { PlaybackProvider } from '../playback';
import elevationCssHref from '../styles/elevation.css?url';
import showCssHref from '../styles/show.css?url';
import { useTRPC } from '../trpc';

function Show() {
  const show = useParams().show!;

  const trpc = useTRPC();

  const [{ error, data: showData }, { data: showStyles }] = useQueries({
    queries: [
      trpc.show.getShowData.queryOptions({ slug: show }),
      trpc.show.getShowStyles.queryOptions({ slug: show }),
    ],
  });

  if (error?.data?.code === 'NOT_FOUND') {
    return <h1>Not Found</h1>;
  }

  if (error) {
    throw error;
  }

  if (!showData) {
    return null;
  }

  return (
    <PlaybackProvider showData={showData}>
      <title>{showData.name} | Festival</title>
      <meta name="description" content={showData.description} />
      <link rel="stylesheet" precedence="any" href={elevationCssHref} />
      <link rel="stylesheet" precedence="any" href={showCssHref} />
      {showStyles ? <style>{showStyles}</style> : null}
      <ShowDisplay showData={showData} />
    </PlaybackProvider>
  );
}

export default Show;
