module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },

  extends: [
    'prettier',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],

  plugins: [
    'import',
    'jsx-a11y',
    'no-only-tests',
    'simple-import-sort',
    'unused-imports',
  ],

  rules: {
    quotes: ['warn', 'single', { avoidEscape: true }],
    'require-unicode-regexp': 'warn',

    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-duplicates': 'warn',

    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',

    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': 'warn',
  },

  ignorePatterns: ['old-frontend/*'],
};
