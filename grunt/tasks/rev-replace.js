'use strict';

const fs = require('fs');
const path = require('path');
const fastGlob = require('fast-glob');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * Rewrites asset references (HTML attrs, CSS url()) against
 * dist/rev-manifest.json. Runs after `rev`, before `htmlmin`, so
 * minification is the last step that touches file content.
 */
module.exports = function (grunt, config) {
  grunt.registerTask(
    'revreplace',
    'Rewrite asset references against the rev manifest.',
    function () {
      if (!config.cacheBusting.enabled) {
        grunt.log.writeln('[rev-replace] skipped (disabled in config)');
        return;
      }

      const done = this.async();
      const logger = createLogger(grunt, 'rev-replace');
      const elapsed = startTimer();
      const { dist } = config.paths;
      const manifestPath = path.join(dist, 'rev-manifest.json');

      (async () => {
        if (!fs.existsSync(manifestPath)) {
          logger.warn('no rev-manifest.json found — run the rev task first. skipping.');
          done();
          return;
        }

        const entries = Object.entries(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
        if (entries.length === 0) {
          done();
          return;
        }

        const files = await fastGlob(['**/*.html', '**/*.css'], { cwd: dist, absolute: true });

        let replacedFiles = 0;
        files.forEach((file) => {
          let contents = fs.readFileSync(file, 'utf8');
          let changed = false;
          entries.forEach(([original, hashed]) => {
            if (contents.includes(original)) {
              contents = contents.split(original).join(hashed);
              changed = true;
            }
          });
          if (changed) {
            fs.writeFileSync(file, contents);
            replacedFiles += 1;
          }
        });

        logger.ok(`updated references in ${replacedFiles} file(s) in ${elapsed()}`);
        done();
      })().catch((error) => {
        reportTaskError(grunt, 'rev-replace', error);
        done();
      });
    },
  );
};
