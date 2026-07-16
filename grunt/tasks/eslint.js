'use strict';

const { ESLint } = require('eslint');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * Wraps ESLint's Node API directly instead of a third-party Grunt plugin —
 * guarantees flat-config support keeps pace with whatever ESLint version
 * is installed, rather than lagging behind a plugin's own release cycle.
 */
module.exports = function (grunt) {
  grunt.registerTask('eslint', 'Lint JavaScript with ESLint.', function () {
    const done = this.async();
    const logger = createLogger(grunt, 'eslint');
    const elapsed = startTimer();

    (async () => {
      const eslint = new ESLint();
      const results = await eslint.lintFiles(['**/*.js', '**/*.mjs']);
      const formatter = await eslint.loadFormatter('stylish');
      const output = await formatter.format(results);

      const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
      const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

      if (output.trim()) {
        grunt.log.writeln(output);
      }

      if (errorCount > 0) {
        throw new Error(`${errorCount} error(s), ${warningCount} warning(s).`);
      }

      logger.ok(`0 errors, ${warningCount} warning(s) in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'eslint', error);
      done();
    });
  });
};
