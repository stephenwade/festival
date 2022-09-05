module.exports = {
  extends: ['@open-wc/eslint-config', 'prettier'],

  plugins: ['simple-import-sort'],

  rules: {
    'require-unicode-regexp': 'error',
    'no-undef': ['error', { typeof: true }],

    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // remove when https://github.com/import-js/eslint-plugin-import/issues/1810 is resolved
    'import/no-unresolved': [
      'error',
      { ignore: ['@open-wc/testing-helpers/pure'] },
    ],
  },

  overrides: [
    {
      files: ['old-frontend/src/reducers/*.js'],
      rules: {
        'default-param-last': 'off',
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
