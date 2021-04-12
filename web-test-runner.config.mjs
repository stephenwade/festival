import { importMapsPlugin } from '@web/dev-server-import-maps';

import { clickPlugin } from './test/clickPlugin.js';

export default {
  coverageConfig: {
    report: true,
    exclude: ['lib/**/*', 'node_modules/**/*'],
  },
  coverage: true,
  nodeResolve: true,
  plugins: [importMapsPlugin(), clickPlugin()],
};
