import { createSpaConfig } from '@open-wc/building-rollup';
import replace from '@rollup/plugin-replace';
import merge from 'deepmerge';
import dotenv from 'dotenv';

const result = dotenv.config({ path: '../../.env' });
if (result.error) {
  throw result.error;
}

const baseConfig = createSpaConfig({
  workbox: false,
});

export default merge(baseConfig, {
  input: './index.html',
  plugins: [
    replace({
      values: {
        MAGIC_PUBLISHABLE_KEY: process.env.FESTIVAL_MAGIC_PUBLISHABLE_KEY,
      },
      preventAssignment: true,
    }),
  ],
});
