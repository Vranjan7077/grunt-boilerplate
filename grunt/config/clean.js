'use strict';

module.exports = function (grunt, config) {
  const { paths } = config;
  return {
    dist: [paths.dist],
    tmp: [paths.tmp],
  };
};
