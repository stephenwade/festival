import type { LoaderFunction } from '@remix-run/node';

export const loader = (() => {
  const backgroundImage = "url('/images/impulse-background.webp')";
  /** fallback color for `--background-image` */
  const backgroundColor = '#131112';
  /** backgroundColor at 75% luminosity */
  const backgroundColorLighter = '#a2bfdc';

  return new Response(
    `body {
  --background-image: ${backgroundImage};
  --background-color: ${backgroundColor};
  --background-color-lighter: ${backgroundColorLighter};
}`,
    { headers: { 'content-type': 'text/css' } }
  );
}) satisfies LoaderFunction;
