'use strict';

const browserSync = require('browser-sync');

const { createLogger } = require('../utils/logger');

// Module-level so the 'bsreload' task (registered below) can reach the
// same running instance — Grunt runs everything in one Node process, so
// this is shared state across both registered tasks for that process's
// lifetime.
let bs;

module.exports = function (grunt, config) {
  const logger = createLogger(grunt, 'browser-sync');

  grunt.registerTask('browsersync', 'Start the browser-sync dev server.', function () {
    // Deliberately NOT this.async() — browserSync.init() is non-blocking,
    // so the task function returns immediately and Grunt moves straight
    // on to the next queued task (watch). The running server is what
    // keeps the Node process alive once the task queue itself is empty.
    bs = browserSync.create();
    bs.init(
      {
        server: { baseDir: config.paths.tmp },
        port: config.devServer.port,
        open: config.devServer.open,
        https: config.devServer.https,
        notify: config.devServer.notify,
        ui: false,
        logLevel: 'silent',
      },
      (err, instance) => {
        if (err) {
          logger.error(err.message);
          return;
        }
        logger.ok(`serving ${config.paths.tmp} at ${instance.options.get('urls').get('local')}`);
      },
    );
  });

  grunt.registerTask(
    'bsreload',
    'Reload/inject via browser-sync after a rebuild.',
    function (kind) {
      if (!bs) {
        return;
      }
      bs.reload(kind === 'css' ? '*.css' : undefined);
    },
  );
};
