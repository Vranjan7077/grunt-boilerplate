'use strict';

const path = require('path');
const fs = require('fs');
const { optimize } = require('svgo');
const fastGlob = require('fast-glob');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

module.exports = function (grunt, config) {
  grunt.registerTask('optimizesvg', 'Optimize SVGs with SVGO.', function () {
    const done = this.async();
    const logger = createLogger(grunt, 'optimize-svg');
    const elapsed = startTimer();
    const srcDir = config.paths.src.images;
    const destDir = `${config.paths.dist}/images`;

    (async () => {
      const files = await fastGlob('**/*.svg', { cwd: srcDir });

      if (files.length === 0) {
        logger.warn('no SVGs found in src/images — skipping.');
        done();
        return;
      }

      let totalBefore = 0;
      let totalAfter = 0;

      files.forEach((relativePath) => {
        const srcPath = path.join(srcDir, relativePath);
        const destPath = path.join(destDir, relativePath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        const input = fs.readFileSync(srcPath, 'utf8');
        const result = optimize(input, { path: srcPath });
        fs.writeFileSync(destPath, result.data);

        totalBefore += Buffer.byteLength(input);
        totalAfter += Buffer.byteLength(result.data);
      });

      const savedPct = totalBefore > 0 ? (100 - (totalAfter / totalBefore) * 100).toFixed(0) : 0;
      logger.ok(`optimized ${files.length} SVG(s), ${savedPct}% smaller, in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'optimize-svg', error);
      done();
    });
  });
};
