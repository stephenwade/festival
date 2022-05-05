import { createSpaConfig } from '@open-wc/building-rollup';
import replace from '@rollup/plugin-replace';
import merge from 'deepmerge';
import copy from 'rollup-plugin-copy';

const baseConfig = createSpaConfig({
  workbox: false,
});

export default merge(baseConfig, {
  input: './index.html',
  plugins: [
    copy({
      targets: [
        { src: '.htaccess', dest: 'dist' },
        { src: 'images/*', dest: 'dist/images' },
        { src: 'media/sets.json', dest: 'dist/media' },
      ],
    }),
    replace({
      values: {
        __buildEnv__: process.env.E2E === 'yes' ? 'e2e' : 'production',
      },
      preventAssignment: true,
    }),
  ],
});
