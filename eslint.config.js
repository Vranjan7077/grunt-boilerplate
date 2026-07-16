'use strict';

const js = require('@eslint/js');
const importX = require('eslint-plugin-import-x');
const globals = require('globals');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  { ignores: ['dist/**', '.tmp/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  importX.flatConfigs.recommended,

  // Build tooling: Gruntfile, grunt/, config/, test/ — CommonJS, Node globals.
  {
    files: ['Gruntfile.js', 'eslint.config.js', 'grunt/**/*.js', 'config/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },

  // Site source: src/js/ — ES modules, browser globals.
  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },

  // Build-validation test suite — ES modules, Node globals.
  {
    files: ['test/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  prettierConfig,
];
