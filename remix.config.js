/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [
    'remix-utils/sse/server',
    'use-local-storage-state',
  ],
  serverModuleFormat: 'cjs',
};
