/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import _import from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import playwright from 'eslint-plugin-playwright';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default tseslint.config(
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  // This doesn't work yet
  // reactHooks.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  playwright.configs['flat/recommended'],

  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  unicorn.configs['flat/recommended'],

  prettier,

  {
    plugins: {
      import: _import,
      'no-only-tests': noOnlyTests,
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
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

    rules: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...reactHooks.configs.recommended.rules,

      'no-plusplus': 'error',
      'object-shorthand': 'warn',
      quotes: ['warn', 'single', { avoidEscape: true }],

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
      'no-only-tests/no-only-tests': 'error',

      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'warn',

      '@typescript-eslint/consistent-type-exports': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off', // Used for route params and in tests
      '@typescript-eslint/only-throw-error': 'off', // Remix allows throwing `Response`s
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

      'unicorn/better-regex': 'off',
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
  },
  {
    files: ['.eslintrc.cjs', 'stylelint.config.js', 'svgo.config.js'],

    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['playwright/**/*.ts', 'playwright/**/*.tsx'],

    rules: {
      'no-empty-pattern': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  includeIgnoreFile(gitignorePath),
);
