'use strict';

/**
 * Determines NODE_ENV before config/index.js is first required. Grunt's
 * CLI has already parsed process.argv by the time Gruntfile.js runs, so we
 * read it directly rather than depending on grunt internals.
 */

const PRODUCTION_TASKS = new Set(['build', 'test']);

function requestedTasks() {
  return process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
}

function resolveEnv() {
  const envFlag = process.argv.find((arg) => arg.startsWith('--env='));
  if (envFlag) {
    const value = envFlag.slice('--env='.length);
    if (value === 'production' || value === 'development') {
      return value;
    }
  }

  const wantsProduction = requestedTasks().some(
    (task) => PRODUCTION_TASKS.has(task) || PRODUCTION_TASKS.has(task.split(':')[0]),
  );

  return wantsProduction ? 'production' : 'development';
}

/**
 * True only for the interactive `grunt dev` watch loop — this is what
 * "fail soft, keep watching" should key off, not NODE_ENV. Every other
 * task (build, lint, test, format:check) must still fail hard so CI and
 * one-shot local runs get a real non-zero exit code.
 */
function isWatchMode() {
  return requestedTasks().some((task) => task === 'dev' || task.split(':')[0] === 'dev');
}

module.exports = { resolveEnv, isWatchMode };
