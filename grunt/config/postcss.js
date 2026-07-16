'use strict';

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = function (grunt, config) {
  const { paths } = config;
  const cssFile = (base) => `${base}/css/main.css`;
  // 'hidden' means: write the .map file, but don't reference it from the
  // CSS output — matches the esbuild task's 'external' mode for JS.
  const mapOption = config.sourceMaps
    ? { inline: false, annotation: config.sourceMaps !== 'hidden' }
    : false;

  const prefixer = autoprefixer({ overrideBrowserslist: config.autoprefixer.browsers });
  const buildProcessors = config.minify.css ? [prefixer, cssnano()] : [prefixer];

  return {
    dev: {
      options: { processors: [prefixer], map: mapOption },
      files: [{ src: cssFile(paths.tmp), dest: cssFile(paths.tmp) }],
    },
    build: {
      options: { processors: buildProcessors, map: mapOption },
      files: [{ src: cssFile(paths.dist), dest: cssFile(paths.dist) }],
    },
  };
};
