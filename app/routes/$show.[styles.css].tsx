import type { LoaderFunction } from '@remix-run/node';

export const loader = (() => {
  const backgroundImageJpeg = "url('/images/impulse-background.jpg')";
  const backgroundImageWebp = "url('/images/impulse-background.webp')";
  /** fallback color for `--background-image` */
  const backgroundColor = '#131112';
  /** backgroundColor at 75% luminosity */
  const backgroundColorLighter = '#a2bfdc';

  // The no-webp and webp classes are added in root.tsx.
  // This determines whether we load the WebP or JPEG format background image.
  return new Response(
    `html.no-webp {
  --background-image: ${backgroundImageJpeg};
}

html.webp {
  --background-image: ${backgroundImageWebp};
}

body {
  --background-color: ${backgroundColor};
  --background-color-lighter: ${backgroundColorLighter};
}`,
    { headers: { 'content-type': 'text/css' } }
  );
}) satisfies LoaderFunction;
