'use strict';

const path = require('path');
const fs = require('fs');

const { resolveEnv, isWatchMode } = require('./grunt/utils/env');

// Must happen before `require('./config')`, since config/index.js reads
// NODE_ENV at require time.
process.env.NODE_ENV = process.env.NODE_ENV || resolveEnv();

const config = require('./config');

// Third-party tasks are loaded explicitly rather than through an
// auto-loader dependency — there are only a handful, and an explicit list
// is easier for a contributor to scan than a "magic" loader.
const CONTRIB_PLUGINS = [
  'grunt-contrib-clean',
  'grunt-contrib-copy',
  'grunt-contrib-watch',
  'grunt-contrib-less',
  'grunt-contrib-htmlmin',
  'grunt-include-replace',
];

module.exports = function (grunt) {
  // Only the interactive `grunt dev` watch loop should survive a failing
  // task — every other command (build, lint, test) must still fail hard.
  if (isWatchMode()) {
    grunt.option('force', true);
  }

  grunt.log.writeln(`Environment: ${config.env}`);

  // One config block per grunt-contrib-*/plugin, under grunt/config/.
  const gruntConfig = { pkg: grunt.file.readJSON('package.json') };
  const configDir = path.join(__dirname, 'grunt', 'config');
  fs.readdirSync(configDir)
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
      const key = path.basename(file, '.js');
      gruntConfig[key] = require(path.join(configDir, file))(grunt, config);
    });
  grunt.initConfig(gruntConfig);

  CONTRIB_PLUGINS.forEach((plugin) => grunt.loadNpmTasks(plugin));

  // One custom task per concern, under grunt/tasks/. Each file exports a
  // function that registers itself.
  const tasksDir = path.join(__dirname, 'grunt', 'tasks');
  fs.readdirSync(tasksDir)
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
      require(path.join(tasksDir, file))(grunt, config);
    });

  require('./grunt/aliases')(grunt);
};
