'use strict';

/**
 * Tiny duration helper so every custom task can report how long it took
 * without each one reimplementing hrtime math.
 */

function startTimer() {
  const start = process.hrtime.bigint();
  return () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    return elapsedMs < 1000 ? `${elapsedMs.toFixed(0)}ms` : `${(elapsedMs / 1000).toFixed(2)}s`;
  };
}

module.exports = { startTimer };
