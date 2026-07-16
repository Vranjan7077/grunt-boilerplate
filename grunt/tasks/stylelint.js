'use strict';

const stylelint = require('stylelint');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * Wraps Stylelint's Node API directly, same reasoning as grunt/tasks/eslint.js
 * — avoids depending on a third-party Grunt plugin's release cadence.
 */
module.exports = function (grunt, config) {
  grunt.registerTask('stylelint', 'Lint LESS with Stylelint.', function () {
    const done = this.async();
    const logger = createLogger(grunt, 'stylelint');
    const elapsed = startTimer();

    (async () => {
      const { results, errored, report } = await stylelint.lint({
        files: [`${config.paths.src.less}/**/*.less`],
        formatter: 'string',
      });

      if (report && report.trim()) {
        grunt.log.writeln(report);
      }

      if (errored) {
        const errorCount = results.reduce((sum, r) => sum + r.warnings.length, 0);
        throw new Error(`${errorCount} issue(s) found.`);
      }

      logger.ok(`0 issues in ${results.length} file(s) in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'stylelint', error);
      done();
    });
  });
};
