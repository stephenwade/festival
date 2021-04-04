import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  coverageConfig: {
    report: true,
    exclude: ['lib/**/*', 'node_modules/**/*'],
  },
  coverage: true,
  nodeResolve: true,
  plugins: [importMapsPlugin()],
};
