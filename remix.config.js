/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [],
  future: {
    // Clerk doesn't support ErrorBoundaryV2 yet
    v2_errorBoundary: false,

    v2_meta: true,
    v2_normalizeFormMethod: true,
  },
};
