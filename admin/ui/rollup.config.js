import merge from 'deepmerge';
import { createSpaConfig } from '@open-wc/building-rollup';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config();

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
