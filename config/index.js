'use strict';

/**
 * Merges config/default.js with the active environment file and freezes
 * the result. The active environment is NODE_ENV, which the `dev`/`build`
 * aliases set before this module is first required; `--env` on the CLI
 * (read in Gruntfile.js) can override it for one-off runs.
 */

const defaults = require('./default');
const paths = require('./paths');

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = base[key];
    const overrideValue = override[key];
    result[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? deepMerge(baseValue, overrideValue)
        : overrideValue;
  }
  return result;
}

function deepFreeze(value) {
  Object.getOwnPropertyNames(value).forEach((key) => {
    const child = value[key];
    if (isPlainObject(child) && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  });
  return Object.freeze(value);
}

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

let environmentOverrides;
try {
  environmentOverrides = require(`./environments/${env}`);
} catch {
  environmentOverrides = {};
}

const merged = deepMerge(defaults, environmentOverrides);
merged.env = env;
merged.paths = paths;

module.exports = deepFreeze(merged);
