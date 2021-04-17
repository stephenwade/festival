module.exports = {
  extends: [
    '@open-wc/eslint-config',
    'eslint-config-prettier',
    'plugin:lit-a11y/recommended',
  ],

  rules: {
    'require-unicode-regexp': 'error',
    'no-undef': ['error', { typeof: true }],
  },

  overrides: [
    {
      files: [
        '**/test/**/*.{html,js,mjs,cjs}',
        '**/demo/**/*.{html,js,mjs,cjs}',
      ],
      rules: {
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
