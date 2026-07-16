'use strict';

const fs = require('fs');
const zlib = require('zlib');
const fastGlob = require('fast-glob');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

const COMPRESSIBLE_EXTENSIONS = ['html', 'css', 'js', 'svg', 'json', 'txt'];

/**
 * Pre-compresses final dist/ assets to .gz/.br siblings using Node's
 * built-in zlib — no extra dependency — so a static host (Netlify, nginx,
 * S3+CloudFront) can serve pre-compressed files instead of compressing on
 * every request.
 */
module.exports = function (grunt, config) {
  grunt.registerTask('compress', 'Pre-compress built assets with gzip/brotli.', function () {
    if (!config.compression.enabled) {
      grunt.log.writeln('[compress] skipped (disabled in config)');
      return;
    }

    const done = this.async();
    const logger = createLogger(grunt, 'compress');
    const elapsed = startTimer();
    const { dist } = config.paths;
    const { algorithms } = config.compression;

    (async () => {
      const pattern = `**/*.{${COMPRESSIBLE_EXTENSIONS.join(',')}}`;
      const files = await fastGlob(pattern, { cwd: dist, absolute: true });

      files.forEach((file) => {
        const contents = fs.readFileSync(file);
        if (algorithms.includes('gzip')) {
          fs.writeFileSync(`${file}.gz`, zlib.gzipSync(contents, { level: 9 }));
        }
        if (algorithms.includes('brotli')) {
          fs.writeFileSync(
            `${file}.br`,
            zlib.brotliCompressSync(contents, {
              params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
            }),
          );
        }
      });

      logger.ok(`pre-compressed ${files.length} file(s) in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'compress', error);
      done();
    });
  });
};
