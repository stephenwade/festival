/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  fixupConfigRules,
  fixupPluginRules,
  includeIgnoreFile,
} from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import _import from 'eslint-plugin-import';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',

      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:playwright/recommended',

      'plugin:@typescript-eslint/strict-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',

      'plugin:unicorn/recommended',

      'prettier',
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      'no-only-tests': noOnlyTests,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        EXPERIMENTAL_useProjectService: true,
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
      'no-plusplus': 'error',
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
