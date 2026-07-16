'use strict';

module.exports = {
  sourceMaps: 'hidden',
  esbuild: {
    minify: true,
  },
  minify: {
    html: true,
    css: true,
    js: true,
  },
  cacheBusting: {
    enabled: true,
  },
  compression: {
    enabled: true,
  },
};
