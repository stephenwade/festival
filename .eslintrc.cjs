module.exports = {
  root: true,

  parserOptions: {
    EXPERIMENTAL_useProjectService: true,
  },

  // Comments link to blockers for flat config
  plugins: [
    // https://github.com/import-js/eslint-plugin-import/pull/3061
    // https://github.com/import-js/eslint-plugin-import/issues/2948
    // https://github.com/un-ts/eslint-plugin-import-x/issues/90
    'import',
    'no-only-tests',
    'simple-import-sort',
    'unused-imports',
  ],

  extends: [
    'eslint:recommended',

    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    // https://github.com/facebook/react/issues/28313
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:playwright/recommended',

    'plugin:@typescript-eslint/strict-type-checked',
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
    '@typescript-eslint/no-non-null-assertion': 'off', // Used for route params and in tests
    '@typescript-eslint/only-throw-error': 'off', // Remix allows throwing `Response`s
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-promise-reject-errors': 'off',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowAny: false,
        allowBoolean: false,
        allowNullish: false,
        allowNumber: true,
        allowRegExp: false,
        allowNever: false,
      },
    ],
    '@typescript-eslint/switch-exhaustiveness-check': [
      'error',
      {
        allowDefaultCaseForExhaustiveSwitch: false,
        requireDefaultForNonUnion: true,
      },
    ],
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
      files: ['.eslintrc.cjs', 'stylelint.config.js', 'svgo.config.js'],

      env: {
        node: true,
      },
    },
    {
      files: ['playwright/**/*.ts', 'playwright/**/*.tsx'],

      rules: {
        'no-empty-pattern': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
};
