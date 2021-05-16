module.exports = {
  extends: ['@open-wc/eslint-config', 'prettier'],

  rules: {
    'require-unicode-regexp': 'error',
    'no-undef': ['error', { typeof: true }],

    // remove when https://github.com/benmosher/eslint-plugin-import/issues/1868 is resolved
    'import/no-unresolved': [
      'error',
      { ignore: ['@open-wc/testing-helpers/pure'] },
    ],
  },

  overrides: [
    {
      files: ['admin/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/test/**/*.{js,cjs,html}'],
      rules: {
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
