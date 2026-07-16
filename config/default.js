'use strict';

/**
 * Base settings, layered under environment-specific overrides in
 * config/environments/. Change values here (or in an environment file) —
 * you should never need to edit files under grunt/ for these.
 */

module.exports = {
  sourceMaps: true,

  autoprefixer: {
    // Browserslist query, also read by any tool that understands Browserslist.
    browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead'],
  },

  esbuild: {
    target: ['es2020'],
    format: 'esm',
    minify: false,
    bundle: true,
  },

  minify: {
    html: false,
    css: false,
    js: false,
  },

  devServer: {
    port: 3000,
    open: true,
    https: false,
    notify: false,
  },

  cacheBusting: {
    enabled: false,
    hashLength: 8,
  },

  compression: {
    enabled: false,
    algorithms: ['gzip', 'brotli'],
  },

  imageOptimization: {
    jpeg: { quality: 80 },
    png: { quality: 80 },
    webp: { quality: 80 },
  },

  htmlValidate: {
    enabled: true,
  },
};
