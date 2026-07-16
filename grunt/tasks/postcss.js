'use strict';

const fs = require('fs');
const postcss = require('postcss');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

/**
 * A thin custom multi-task wrapping PostCSS's Node API directly, instead
 * of grunt-postcss — that plugin is pinned to postcss@6 and throws
 * "is not a PostCSS plugin" against current autoprefixer/cssnano, which
 * ship postcss@8. Config still lives in grunt/config/postcss.js so this
 * reads like any other plugin task.
 */
module.exports = function (grunt) {
  grunt.registerMultiTask('postcss', 'Run PostCSS processors over compiled CSS.', function () {
    const done = this.async();
    const logger = createLogger(grunt, 'postcss');
    const elapsed = startTimer();
    const { processors, map } = this.options({ processors: [], map: false });

    Promise.all(
      this.files.map(async (file) => {
        const src = file.src[0];
        if (!src || !fs.existsSync(src)) {
          return;
        }
        const css = fs.readFileSync(src, 'utf8');
        const result = await postcss(processors).process(css, { from: src, to: file.dest, map });
        fs.writeFileSync(file.dest, result.css);
        if (result.map) {
          fs.writeFileSync(`${file.dest}.map`, result.map.toString());
        }
      }),
    )
      .then(() => {
        logger.ok(`processed in ${elapsed()}`);
        done();
      })
      .catch((error) => {
        reportTaskError(grunt, 'postcss', error);
        done();
      });
  });
};
