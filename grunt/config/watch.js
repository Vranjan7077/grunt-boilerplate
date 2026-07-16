'use strict';

/**
 * Grunt-contrib-watch only ever triggers tasks here — it never owns
 * reloading itself. Browser-sync (grunt/tasks/browser-sync.js) listens for
 * the same file events and handles CSS injection / page reload, so there's
 * a single source of truth for "what changed" instead of two competing
 * watchers.
 */
module.exports = function (grunt, config) {
  const { paths } = config;

  return {
    options: {
      spawn: false,
    },
    static: {
      files: [`${paths.src.static}/**/*`, `${paths.src.fonts}/**/*`, `${paths.src.images}/**/*`],
      tasks: ['copy:dev', 'bsreload'],
    },
    less: {
      files: [`${paths.src.less}/**/*.less`],
      tasks: ['less:dev', 'postcss:dev', 'bsreload:css'],
    },
    html: {
      files: [`${paths.src.html}/**/*.html`],
      tasks: ['includereplace:dev', 'bsreload'],
    },
    js: {
      files: [`${paths.src.js}/**/*.js`],
      tasks: ['esbuild:dev', 'bsreload'],
    },
  };
};
