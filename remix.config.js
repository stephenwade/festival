/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: ['supports-webp'],
  future: {
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
  },
};
