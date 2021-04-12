import { importMapsPlugin } from '@web/dev-server-import-maps';
import range from 'koa-range';

import { clickPlugin } from './test/clickPlugin.js';

export default {
  middleware: [range],
  coverageConfig: {
    report: true,
    exclude: ['lib/**/*', 'node_modules/**/*'],
  },
  coverage: true,
  nodeResolve: true,
  plugins: [importMapsPlugin(), clickPlugin()],
};
