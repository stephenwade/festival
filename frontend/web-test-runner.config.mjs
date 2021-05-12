import { importMapsPlugin } from '@web/dev-server-import-maps';
import range from 'koa-range';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { clickPlugin } from './test/clickPlugin.js';

export default {
  middleware: [range],
  coverageConfig: {
    report: true,
    exclude: ['lib/**/*', 'node_modules/**/*'],
  },
  coverage: true,
  nodeResolve: true,
  appIndex: 'index.html',
  plugins: [importMapsPlugin(), clickPlugin()],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
  ],
};
