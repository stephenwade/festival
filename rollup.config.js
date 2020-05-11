import merge from 'deepmerge';
import { createSpaConfig } from '@open-wc/building-rollup';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

const baseConfig = createSpaConfig({
  injectServiceWorker: false,
});

export default merge(baseConfig, {
  input: './index.html',
  plugins: [
    copy({
      targets: [{ src: 'images/*', dest: 'dist/images' }],
    }),
    replace({
      __buildEnv__: 'production',
    }),
  ],
});
