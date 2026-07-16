'use strict';

/**
 * Consistent `[task-name]` prefixed, colored output for custom tasks, so
 * dev-mode and build-mode logs read the same way regardless of which task
 * produced them.
 */

function createLogger(grunt, scope) {
  const prefix = `[${scope}]`;
  return {
    info: (message) => grunt.log.writeln(`${prefix} ${message}`),
    ok: (message) => grunt.log.ok(`${prefix} ${message}`),
    warn: (message) => grunt.log.warn(`${prefix} ${message}`),
    error: (message) => grunt.log.error(`${prefix} ${message}`),
  };
}

module.exports = { createLogger };
