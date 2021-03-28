module.exports = {
  extends: ['@open-wc/eslint-config', 'eslint-config-prettier'],

  // TODO: remove when https://github.com/open-wc/open-wc/pull/2107 is merged
  overrides: [
    {
      files: [
        '**/test/**/*.{html,js,mjs,ts}',
        '**/demo/**/*.{html,js,mjs,ts}',
        '**/stories/**/*.{html,js,mjs,ts}',
      ],
      rules: {
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
