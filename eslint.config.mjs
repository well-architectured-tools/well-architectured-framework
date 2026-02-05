// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import typescriptParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default defineConfig(
  { ignores: ['dist'] },
  {
    files: ['eslint.config.mjs'],
    extends: [eslint.configs.recommended],
  },
  {
    files: ['src/**/*.{ts,mts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      'no-console': 'error',
      'no-process-env': 'error',
      'no-param-reassign': 'error',
      'require-atomic-updates': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowDirectConstAssertionInArrowFunctions: false,
          allowedNames: [],
          allowExpressions: false,
          allowFunctionsWithoutTypeParameters: false,
          allowHigherOrderFunctions: false,
          allowIIFEs: false,
          allowTypedFunctionExpressions: false,
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'minimumDescriptionLength': 10,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
        },
      ],
      '@typescript-eslint/member-ordering': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,mts}'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/elements': [
        {
          type: 'data-index',
          pattern: 'src/data/*/index.{ts,mts}',
          mode: 'full',
          capture: ['dataName'],
        },
        {
          type: 'data',
          pattern: 'src/data/*/**/*.{ts,mts}',
          mode: 'full',
          capture: ['dataName'],
        },
        {
          type: 'lib-index',
          pattern: 'src/libs/*/index.{ts,mts}',
          mode: 'full',
          capture: ['libName'],
        },
        {
          type: 'lib',
          pattern: 'src/libs/*/**/*.{ts,mts}',
          mode: 'full',
          capture: ['libName'],
        },
        {
          type: 'module-index',
          pattern: 'src/modules/*/index.{ts,mts}',
          mode: 'full',
          capture: ['moduleName'],
        },
        {
          type: 'module',
          pattern: 'src/modules/*/**/*.{ts,mts}',
          mode: 'full',
          capture: ['moduleName'],
        },
        {
          type: 'transport-index',
          pattern: 'src/transports/*/index.{ts,mts}',
          mode: 'full',
          capture: ['transportName'],
        },
        {
          type: 'transport',
          pattern: 'src/transports/*/**/*.{ts,mts}',
          mode: 'full',
          capture: ['transportName'],
        },
        {
          type: 'index',
          pattern: 'src/index.{ts,mts}',
          mode: 'full',
        },
      ],
    },
    rules: {
      ...boundaries.configs.strict.rules,
      'boundaries/element-types': [
        2,
        {
          default: 'disallow',
          rules: [
            {
              from: ['data'],
              allow: [['data', { dataName: '${from.dataName}' }], ['lib-index']],
            },
            {
              from: ['lib'],
              allow: [['lib', { libName: '${from.libName}' }], ['lib-index']],
            },
            {
              from: ['module'],
              allow: [['module', { moduleName: '${from.moduleName}' }], ['lib-index']],
            },
            {
              from: ['transport'],
              allow: [['transport', { transportName: '${from.transportName}' }], ['lib-index'], ['module-index']],
            },
            {
              from: ['index'],
              allow: [['lib-index'], ['transport-index']],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,mts}'],
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
    },
  },
  {
    files: ['src/data/**/*.{ts,mts}'],
    rules: {
      '@typescript-eslint/typedef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: [
      'src/**/*.test.{ts,mts}',
      'src/**/*.uc-test.{ts,mts}',
      'src/**/*.infra-test.{ts,mts}',
      'src/**/*.e2e-test.{ts,mts}',
    ],
    rules: {},
  },
);
