'use strict';

const { createLogger } = require('./logger');
const { isWatchMode } = require('./env');

/**
 * Reports a custom task's failure consistently. Every one-shot command
 * (build, lint, test, format:check) is fatal — non-zero exit, pipeline
 * stops. Only the interactive `grunt dev` watch loop is soft: Gruntfile.js
 * turns on Grunt's `--force` behavior there so the run survives a failure;
 * this just makes sure it's still logged loudly instead of failing
 * silently.
 */
function reportTaskError(grunt, scope, error) {
  const logger = createLogger(grunt, scope);
  const message = error && error.message ? error.message : String(error);
  logger.error(message);

  if (isWatchMode()) {
    grunt.fail.warn(`${scope} failed — fix the error above and save again.`);
    return;
  }

  grunt.fail.fatal(`${scope} failed: ${message}`);
}

module.exports = { reportTaskError };
