'use strict';

/**
 * Every user-facing entry point into the build lives here. Individual
 * tasks are registered by grunt/config/*.js (contrib plugins) and
 * grunt/tasks/*.js (custom tasks) — this file only sequences them.
 */
module.exports = function (grunt) {
  grunt.registerTask('default', ['build']);

  grunt.registerTask('dev', [
    'clean:tmp',
    'less:dev',
    'postcss:dev',
    'esbuild:dev',
    'includereplace:dev',
    'copy:dev',
    'browsersync',
    'watch',
  ]);
  grunt.registerTask('build', [
    'clean:dist',
    'less:build',
    'postcss:build',
    'esbuild:build',
    'includereplace:build',
    'optimizeimages',
    'optimizesvg',
    'rev',
    'revreplace',
    'htmlmin:build',
    'copy:build',
    'compress',
  ]);
  grunt.registerTask('lint', ['includereplace:dev', 'htmlvalidate', 'eslint', 'stylelint']);
  // 'format' and 'format:check' are registered directly by
  // grunt/tasks/format.js — nothing to alias here.
  grunt.registerTask('test', ['lint', 'nodetest']);
};
