'use strict';

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const fastGlob = require('fast-glob');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * Raster image optimization via sharp's Node API, not
 * grunt-contrib-imagemin — its upstream `imagemin` core is stagnant and
 * has ESM-interop problems when required from a CommonJS Gruntfile. Only
 * runs for production builds; dev just copies images as-is (see
 * grunt/config/copy.js) since optimizing on every save is wasted work.
 */
module.exports = function (grunt, config) {
  grunt.registerTask('optimizeimages', 'Optimize raster images with sharp.', function () {
    const done = this.async();
    const logger = createLogger(grunt, 'optimize-images');
    const elapsed = startTimer();
    const { imageOptimization } = config;
    const srcDir = config.paths.src.images;
    const destDir = `${config.paths.dist}/images`;

    (async () => {
      const files = await fastGlob('**/*.{jpg,jpeg,png,webp}', {
        cwd: srcDir,
        caseSensitiveMatch: false,
      });

      if (files.length === 0) {
        logger.warn('no raster images found in src/images — skipping.');
        done();
        return;
      }

      let totalBefore = 0;
      let totalAfter = 0;

      await Promise.all(
        files.map(async (relativePath) => {
          const srcPath = path.join(srcDir, relativePath);
          const destPath = path.join(destDir, relativePath);
          fs.mkdirSync(path.dirname(destPath), { recursive: true });

          const ext = path.extname(relativePath).slice(1).toLowerCase();
          let pipeline = sharp(srcPath);

          if (ext === 'jpg' || ext === 'jpeg') {
            pipeline = pipeline.jpeg({ quality: imageOptimization.jpeg.quality, mozjpeg: true });
          } else if (ext === 'png') {
            pipeline = pipeline.png({ quality: imageOptimization.png.quality, palette: true });
          } else if (ext === 'webp') {
            pipeline = pipeline.webp({ quality: imageOptimization.webp.quality });
          }

          await pipeline.toFile(destPath);
          totalBefore += fs.statSync(srcPath).size;
          totalAfter += fs.statSync(destPath).size;
        }),
      );

      const savedPct = totalBefore > 0 ? (100 - (totalAfter / totalBefore) * 100).toFixed(0) : 0;
      logger.ok(`optimized ${files.length} image(s), ${savedPct}% smaller, in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'optimize-images', error);
      done();
    });
  });
};
