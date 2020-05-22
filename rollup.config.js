/*
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
      targets: [{ src: 'images/*', dest: 'dist/images' }],
    }),
    replace({
      __buildEnv__: 'production',
    }),
  ],
});
*/

// until open-wc/open-wc#1625 and open-wc/open-wc#1666 are fixed, use this config
// based on https://github.com/open-wc/open-wc/issues/1625#issuecomment-627605238

import html from '@open-wc/rollup-plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import {
  babelConfigRollupGenerate,
  createBabelConfigRollupBuild,
} from '@open-wc/building-rollup/src/babel/babel-configs';

babelConfigRollupGenerate.plugins = babelConfigRollupGenerate.plugins.slice(1);

const c = {
  preserveEntrySignatures: false,
  treeshake: true,
  output: {
    format: 'es',
    dir: 'dist',
    entryFileNames: '[hash].js',
    plugins: [babel.generated(babelConfigRollupGenerate)],
  },
  plugins: [
    resolve(),
    babel(createBabelConfigRollupBuild()),
    terser({ output: { comments: false } }),
    html({
      minify: true,
      inject: true,
    }),
  ],
};

import merge from 'deepmerge';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

export default merge(c, {
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
