'use strict';

module.exports = {
  sourceMaps: true,
  esbuild: {
    minify: false,
  },
  minify: {
    html: false,
    css: false,
    js: false,
  },
  cacheBusting: {
    enabled: false,
  },
  compression: {
    enabled: false,
  },
};
