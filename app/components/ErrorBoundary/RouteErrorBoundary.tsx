import { useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError();

  return (
    <>
      <h1>Error</h1>
      <p>
        {error instanceof Error
          ? error.message
          : 'Something went wrong while loading this page.'}
      </p>
    </>
  );
}
