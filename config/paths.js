'use strict';

/**
 * Single source of truth for every source/output directory the build touches.
 * Every task config and custom task should import from here instead of
 * hardcoding a path string.
 */

const path = require('path');

// Every exported path is forward-slash, even on Windows. Node's fs APIs
// accept forward slashes natively, and this means any task that builds a
// glob via `${paths.src.less}/**/*.less` gets a consistent pattern instead
// of a backslash/forward-slash mix that some glob engines (fast-glob,
// stylelint) fail to match against.
function toPosix(value) {
  return value.split(path.sep).join('/');
}

const root = toPosix(path.resolve(__dirname, '..'));

const src = `${root}/src`;
const dist = `${root}/dist`;
const tmp = `${root}/.tmp`;

module.exports = {
  root,
  dist,
  tmp,

  src: {
    root: src,
    html: `${src}/html`,
    htmlPages: `${src}/html/pages`,
    htmlPartials: `${src}/html/partials`,
    less: `${src}/less`,
    lessEntry: `${src}/less/main.less`,
    js: `${src}/js`,
    jsEntries: `${src}/js/entries`,
    images: `${src}/images`,
    fonts: `${src}/fonts`,
    static: `${src}/static`,
  },
};
