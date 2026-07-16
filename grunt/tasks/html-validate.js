'use strict';

const fs = require('fs');
const path = require('path');
const fastGlob = require('fast-glob');
const { HtmlValidate } = require('html-validate');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * Validates the resolved HTML output (post @@include), not src/html/pages
 * directly — the raw source still contains @@include(...) directives,
 * which aren't valid HTML on their own. `lint` runs `includereplace:dev`
 * first so this always has something real to check.
 */
module.exports = function (grunt, config) {
  grunt.registerTask('htmlvalidate', 'Validate resolved HTML output.', function () {
    if (!config.htmlValidate.enabled) {
      grunt.log.writeln('[html-validate] skipped (disabled in config)');
      return;
    }

    const done = this.async();
    const logger = createLogger(grunt, 'html-validate');
    const elapsed = startTimer();

    (async () => {
      // The bare constructor does NOT auto-discover .htmlvalidate.json —
      // that lookup only happens inside html-validate's own CLI. Load and
      // pass it explicitly so this task honors the same rules.
      const validateConfig = JSON.parse(
        fs.readFileSync(path.join(config.paths.root, '.htmlvalidate.json'), 'utf8'),
      );
      const htmlValidate = new HtmlValidate(validateConfig);
      const files = await fastGlob('**/*.html', { cwd: config.paths.tmp, absolute: true });

      let issueCount = 0;
      for (const file of files) {
        const report = await htmlValidate.validateFile(file);
        for (const result of report.results) {
          for (const message of result.messages) {
            issueCount += 1;
            const relativePath = path.relative(config.paths.root, file);
            logger.error(
              `${relativePath}:${message.line}:${message.column} ${message.message} (${message.ruleId})`,
            );
          }
        }
      }

      if (issueCount > 0) {
        throw new Error(`${issueCount} HTML validation issue(s) found.`);
      }

      logger.ok(`0 issues across ${files.length} file(s) in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'html-validate', error);
      done();
    });
  });
};
