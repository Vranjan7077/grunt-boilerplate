'use strict';

const { execSync } = require('child_process');

const { createLogger } = require('../utils/logger');
const { reportTaskError } = require('../utils/error-handler');

module.exports = function (grunt) {
  grunt.registerTask('nodetest', 'Run the node:test build-validation suite.', function () {
    const logger = createLogger(grunt, 'test');
    try {
      // No path argument: relies on node:test's default recursive
      // discovery from cwd, which finds test/build.test.mjs. Passing an
      // explicit directory here is unreliable across Node versions.
      execSync('node --test', { stdio: 'inherit' });
      logger.ok('done');
    } catch (error) {
      reportTaskError(grunt, 'test', error);
    }
  });
};
