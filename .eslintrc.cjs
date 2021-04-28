module.exports = {
  extends: ['@open-wc/eslint-config', 'prettier'],

  rules: {
    'require-unicode-regexp': 'error',
    'no-undef': ['error', { typeof: true }],
  },

  overrides: [
    {
      files: ['backend/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/test/**/*.{js,html}'],
      rules: {
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
