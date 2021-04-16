import merge from 'deepmerge';
import { createSpaConfig } from '@open-wc/building-rollup';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

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
      values: { __buildEnv__: 'production' },
      preventAssignment: true,
    }),
  ],
});
