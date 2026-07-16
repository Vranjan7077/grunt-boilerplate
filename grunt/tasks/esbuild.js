'use strict';

const esbuild = require('esbuild');
const fastGlob = require('fast-glob');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * Bundles every file in src/js/entries/ with esbuild's Node API directly,
 * rather than a pre-built esbuild Grunt plugin — esbuild is already fast
 * enough per-invocation (milliseconds) that Grunt-level orchestration adds
 * no meaningful overhead, and wrapping it ourselves means zero lag behind
 * new esbuild releases.
 */
module.exports = function (grunt, config) {
  grunt.registerTask('esbuild', 'Bundle JS entries with esbuild.', function (target) {
    if (target !== 'dev' && target !== 'build') {
      grunt.fail.fatal('Usage: grunt esbuild:dev or grunt esbuild:build');
      return;
    }

    const done = this.async();
    const logger = createLogger(grunt, 'esbuild');
    const elapsed = startTimer();
    const outdir = target === 'build' ? `${config.paths.dist}/js` : `${config.paths.tmp}/js`;

    (async () => {
      const entryPoints = await fastGlob('*.js', {
        cwd: config.paths.src.jsEntries,
        absolute: true,
      });
      if (entryPoints.length === 0) {
        logger.warn('no entry points found in src/js/entries — skipping.');
        done();
        return;
      }

      await esbuild.build({
        entryPoints,
        outdir,
        bundle: config.esbuild.bundle,
        format: config.esbuild.format,
        target: config.esbuild.target,
        minify: config.esbuild.minify,
        sourcemap: config.sourceMaps === 'hidden' ? 'external' : Boolean(config.sourceMaps),
        logLevel: 'silent',
      });

      logger.ok(
        `bundled ${entryPoints.length} entr${entryPoints.length === 1 ? 'y' : 'ies'} in ${elapsed()}`,
      );
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'esbuild', error);
      done();
    });
  });
};
