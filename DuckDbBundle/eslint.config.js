import js from '@eslint/js';
import globals from 'globals';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    files: ['src/**/*.{js,ts,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ['vite.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        URL: 'readonly',
        fetch: 'readonly',
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
      globals: globals.browser,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  // カスタムルール (@nuxt/eslint 基準)
  {
    rules: {
      'no-debugger': 'error',
      'quotes': ['error', 'single'],
      'no-console': 'warn',
      '@stylistic/semi': 'off',
      'semi': ['error', 'always'],
      'vue/first-attribute-linebreak': ['error', {
        singleline: 'beside',
        multiline: 'ignore',
      }],
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
);
