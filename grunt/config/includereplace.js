'use strict';

/**
 * Resolves @@include('../partials/x.html', {"var": "value"}) directives in
 * every page under src/html/pages/. This is deliberately simple templating
 * (includes + variable substitution, no loops/conditionals) — swap in
 * Nunjucks if a project needs more than that (see docs/customization.md).
 */
module.exports = function (grunt, config) {
  const { paths } = config;

  const target = (dest) => ({
    options: {
      includesDir: `${paths.src.htmlPartials}/`,
      globals: { env: config.env },
    },
    expand: true,
    cwd: paths.src.htmlPages,
    src: ['**/*.html'],
    dest,
  });

  return {
    dev: target(paths.tmp),
    build: target(paths.dist),
  };
};
