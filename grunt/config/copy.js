'use strict';

/**
 * Static passthrough files only. Images are handled by the optimize-images
 * / optimize-svg custom tasks (grunt/tasks/), not copied verbatim in a
 * production build — in dev they're copied here as-is for fast rebuilds,
 * since optimizing on every save would be wasted work.
 */
module.exports = function (grunt, config) {
  const { paths } = config;

  const staticFiles = (dest) => [
    { expand: true, cwd: paths.src.static, src: ['**'], dest },
    { expand: true, cwd: paths.src.fonts, src: ['**'], dest: `${dest}/fonts` },
  ];

  return {
    dev: {
      files: [
        ...staticFiles(paths.tmp),
        { expand: true, cwd: paths.src.images, src: ['**'], dest: `${paths.tmp}/images` },
      ],
    },
    build: {
      files: staticFiles(paths.dist),
    },
  };
};
