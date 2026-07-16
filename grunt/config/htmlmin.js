'use strict';

module.exports = function (grunt, config) {
  const { paths } = config;

  return {
    build: {
      options: config.minify.html
        ? {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
          }
        : {},
      expand: true,
      cwd: paths.dist,
      src: ['**/*.html'],
      dest: paths.dist,
    },
  };
};
