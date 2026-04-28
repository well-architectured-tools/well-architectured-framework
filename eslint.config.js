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
    files: ['eslint.config.js'],
    extends: [eslint.configs.recommended],
  },
  {
    files: ['src/**/*.ts'],
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
      '@typescript-eslint/no-empty-object-type': 'off',
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
    files: ['src/**/*.ts'],
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
          type: 'lib-index',
          pattern: 'src/libs/*/index.ts',
          mode: 'full',
          capture: ['libName'],
        },
        {
          type: 'lib',
          pattern: 'src/libs/*/**/*.ts',
          mode: 'full',
          capture: ['libName'],
        },
        {
          type: 'module-index',
          pattern: 'src/modules/*/index.ts',
          mode: 'full',
          capture: ['moduleName'],
        },
        {
          type: 'module-domain',
          pattern: 'src/modules/*/domain/**/*.ts',
          mode: 'full',
          capture: ['moduleName'],
        },
        {
          type: 'module-infrastructure',
          pattern: 'src/modules/*/infrastructure/**/*.ts',
          mode: 'full',
          capture: ['moduleName'],
        },
        {
          type: 'module-interactors',
          pattern: 'src/modules/*/interactors/**/*.ts',
          mode: 'full',
          capture: ['moduleName'],
        },
        {
          type: 'transport-index',
          pattern: 'src/transports/*/index.ts',
          mode: 'full',
          capture: ['transportName'],
        },
        {
          type: 'transport',
          pattern: 'src/transports/*/**/*.ts',
          mode: 'full',
          capture: ['transportName'],
        },
        {
          type: 'index',
          pattern: 'src/index.ts',
          mode: 'full',
        },
      ],
    },
    rules: {
      ...boundaries.configs.strict.rules,
      'boundaries/element-types': 'off',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'lib' },
              allow: {
                to: [{ type: 'lib', captured: { libName: '{{ from.captured.libName }}' } }, { type: 'lib-index' }],
              },
            },
            {
              from: { type: 'lib-index' },
              allow: {
                to: { type: 'lib', captured: { libName: '{{ from.captured.libName }}' } },
              },
            },
            {
              from: { type: 'lib', captured: { libName: 'dependency-injection' } },
              allow: {
                to: { type: ['transport-index', 'module-index'] },
              },
            },
            {
              from: { type: 'module-domain' },
              allow: {
                to: [
                  { type: 'module-domain', captured: { moduleName: '{{ from.captured.moduleName }}' } },
                  { type: 'lib-index' },
                ],
              },
            },
            {
              from: { type: 'module-interactors' },
              allow: {
                to: [
                  { type: 'module-interactors', captured: { moduleName: '{{ from.captured.moduleName }}' } },
                  { type: 'module-domain' },
                  { type: 'lib-index' },
                ],
              },
            },
            {
              from: { type: 'module-infrastructure' },
              allow: {
                to: [
                  { type: 'module-infrastructure', captured: { moduleName: '{{ from.captured.moduleName }}' } },
                  { type: 'module-domain' },
                  { type: 'module-interactors' },
                  { type: 'lib-index' },
                ],
              },
            },
            {
              from: { type: 'module-index' },
              allow: {
                to: [
                  { type: 'module-domain', captured: { moduleName: '{{ from.captured.moduleName }}' } },
                  { type: 'module-infrastructure', captured: { moduleName: '{{ from.captured.moduleName }}' } },
                  { type: 'module-interactors', captured: { moduleName: '{{ from.captured.moduleName }}' } },
                ],
              },
            },
            {
              from: { type: 'transport' },
              allow: {
                to: [
                  { type: 'transport', captured: { transportName: '{{ from.captured.transportName }}' } },
                  { type: 'lib-index' },
                  { type: 'module-index' },
                ],
              },
            },
            {
              from: { type: 'transport-index' },
              allow: {
                to: { type: 'transport', captured: { transportName: '{{ from.captured.transportName }}' } },
              },
            },
            {
              from: { type: 'index' },
              allow: {
                to: { type: 'lib-index' },
              },
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/consistent-function-scoping': 'off',
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.uc-test.ts', 'src/**/*.infra-test.ts', 'src/**/*.e2e-test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);
