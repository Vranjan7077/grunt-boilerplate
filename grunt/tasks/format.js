'use strict';

const { execSync } = require('child_process');

const { createLogger } = require('../utils/logger');
const { reportTaskError } = require('../utils/error-handler');

/**
 * The one deliberate exception to "wrap the tool's Node API directly":
 * Prettier's CLI already does glob resolution, .prettierignore handling,
 * and parser detection across the whole project — reimplementing that
 * against the lower-level API would be pure duplication for no benefit.
 * `args` here is always a static, hardcoded string (never user input), so
 * shelling out with execSync is safe.
 */
function runPrettier(grunt, args) {
  const logger = createLogger(grunt, 'prettier');
  try {
    execSync(`npx prettier ${args}`, { stdio: 'inherit' });
    logger.ok('done');
  } catch (error) {
    reportTaskError(grunt, 'prettier', error);
  }
}

module.exports = function (grunt) {
  grunt.registerTask('format', 'Format the codebase with Prettier.', function () {
    runPrettier(grunt, '--write .');
  });

  grunt.registerTask('format:check', 'Check formatting with Prettier.', function () {
    runPrettier(grunt, '--check .');
  });
};
