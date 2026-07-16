'use strict';

module.exports = function (grunt, config) {
  const { paths } = config;
  const options = { sourceMap: Boolean(config.sourceMaps) };

  return {
    dev: {
      options,
      files: {
        [`${paths.tmp}/css/main.css`]: paths.src.lessEntry,
      },
    },
    build: {
      options,
      files: {
        [`${paths.dist}/css/main.css`]: paths.src.lessEntry,
      },
    },
  };
};
