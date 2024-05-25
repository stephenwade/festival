module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: true,
  },

  // Comments link to blockers for flat config
  plugins: [
    // https://github.com/import-js/eslint-plugin-import/pull/2873
    // https://github.com/import-js/eslint-plugin-import/issues/2948
    // https://github.com/un-ts/eslint-plugin-import-x/issues/29
    'import',
    // https://github.com/levibuzolic/eslint-plugin-no-only-tests/issues/43
    'no-only-tests',
    'simple-import-sort',
    'unused-imports',
  ],

  extends: [
    'eslint:recommended',

    // https://github.com/jsx-eslint/eslint-plugin-react/issues/3699
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    // https://github.com/facebook/react/issues/28313
    'plugin:react-hooks/recommended',
    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/pull/891
    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/978
    'plugin:jsx-a11y/recommended',
    'plugin:playwright/recommended',

    // https://github.com/typescript-eslint/typescript-eslint/milestone/9
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',

    'plugin:unicorn/recommended',

    'prettier',
  ],

  rules: {
    'object-shorthand': 'warn',
    quotes: ['warn', 'single', { avoidEscape: true }],
    'require-unicode-regexp': 'warn',

    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-duplicates': 'warn',

    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',

    'playwright/expect-expect': [
      'warn',
      {
        assertFunctionNames: [
          'expectAudioIsPlaying',
          'expectAudioIsNotPlaying',
          'expectAudioCurrentTimeToAlmostEqual',
        ],
      },
    ],

    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': 'warn',

    '@typescript-eslint/consistent-type-exports': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-useless-undefined': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-switch': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/switch-case-braces': 'off',

    'react/jsx-no-leaked-render': ['warn', { validStrategies: ['ternary'] }],
  },

  settings: {
    react: {
      version: 'detect',
    },
    formComponents: ['Form'],
    linkComponents: [
      { name: 'Link', linkAttribute: 'to' },
      { name: 'NavLink', linkAttribute: 'to' },
    ],
  },

  overrides: [
    {
      files: ['.eslintrc.cjs', 'stylelint.config.js'],

      env: {
        node: true,
      },
    },
    {
      files: ['playwright/**/*.ts'],

      rules: {
        'no-empty-pattern': 'off',
      },
    },
  ],
};
