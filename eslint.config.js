import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import * as comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { importX } from 'eslint-plugin-import-x';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import playwright from 'eslint-plugin-playwright';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default defineConfig(
  js.configs.recommended,
  comments.recommended,
  eslintReact.configs['recommended-type-checked'],
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  jsxA11yX.configs.recommended,
  playwright.configs['flat/recommended'],

  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  unicorn.configs.recommended,

  prettier,

  {
    plugins: {
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
      '@eslint-community/eslint-comments/require-description': [
        'warn',
        { ignore: ['eslint-enable'] },
      ],

      'no-restricted-globals': [
        'error',
        { name: 'Date', message: 'Use `Temporal` instead.' },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            Date: 'Use `Temporal` instead.',
          },
        },
      ],

      'no-plusplus': 'error',
      'object-shorthand': 'warn',
      quotes: ['warn', 'single', { avoidEscape: true }],

      'import-x/first': 'warn',
      'import-x/newline-after-import': 'warn',
      'import-x/no-named-as-default-member': 'off',

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
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/prefer-readonly': 'warn',
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
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-event-target': 'off',
      'unicorn/prevent-abbreviations': 'off',

      // temporary
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/consistent-class-member-order': 'off',
      'unicorn/max-nested-calls': 'off',
      'unicorn/no-array-from-fill': 'off',
      'unicorn/no-declarations-before-early-exit': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/no-non-function-verb-prefix': 'off',
      'unicorn/no-return-array-push': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/no-unnecessary-global-this': 'off',
      'unicorn/no-unreadable-array-destructuring': 'off',
      'unicorn/no-unreadable-for-of-expression': 'off',
      'unicorn/no-unsafe-property-key': 'off',
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-minimal-ternary': 'off',
      'unicorn/prefer-short-arrow-method': 'off',
      'unicorn/prefer-type-literal-last': 'off',
    },
  },
  {
    files: ['playwright/**/*.ts', 'playwright/**/*.tsx'],

    rules: {
      '@eslint-react/rules-of-hooks': 'off',
    },
  },
  {
    files: ['app/**/*.ts', 'app/**/*.tsx'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: String.raw`(?:\.\./)+server/.*`,
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['server/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [{ regex: String.raw`(?:\.\./)+app/.*` }],
        },
      ],
    },
  },
  includeIgnoreFile(gitignorePath),
);
