'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fastGlob = require('fast-glob');

const { createLogger } = require('../utils/logger');
const { startTimer } = require('../utils/timer');
const { reportTaskError } = require('../utils/error-handler');

function hashFile(filePath, length) {
  return crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex').slice(0, length);
}

/**
 * Content-hashes every built CSS/JS/image file, renames it in place, and
 * writes dist/rev-manifest.json. Deliberately just `crypto` + `fast-glob`
 * — grunt-filerev exists but is another unmaintained plugin for something
 * this simple to do directly.
 */
module.exports = function (grunt, config) {
  grunt.registerTask('rev', 'Content-hash built assets and write a manifest.', function () {
    if (!config.cacheBusting.enabled) {
      grunt.log.writeln('[rev] skipped (disabled in config)');
      return;
    }

    const done = this.async();
    const logger = createLogger(grunt, 'rev');
    const elapsed = startTimer();
    const { dist } = config.paths;
    const { hashLength } = config.cacheBusting;

    (async () => {
      const files = await fastGlob(
        ['css/*.css', 'js/*.js', 'images/**/*.{jpg,jpeg,png,webp,svg}'],
        {
          cwd: dist,
        },
      );

      const manifest = {};

      files.forEach((relativePath) => {
        const absPath = path.join(dist, relativePath);
        const hash = hashFile(absPath, hashLength);
        const ext = path.extname(relativePath);
        const base = relativePath.slice(0, -ext.length);
        const hashedRelative = `${base}.${hash}${ext}`;
        const hashedAbsPath = path.join(dist, hashedRelative);

        fs.renameSync(absPath, hashedAbsPath);
        manifest[`/${relativePath.replace(/\\/g, '/')}`] = `/${hashedRelative.replace(/\\/g, '/')}`;

        // Carry the sourcemap along under the same hash and repoint the
        // sourceMappingURL comment inside the file that was just renamed.
        const mapPath = `${absPath}.map`;
        if (fs.existsSync(mapPath)) {
          const hashedMapPath = `${hashedAbsPath}.map`;
          fs.renameSync(mapPath, hashedMapPath);
          const hashedMapBasename = path.basename(hashedMapPath);
          let contents = fs.readFileSync(hashedAbsPath, 'utf8');
          contents = contents
            .replace(/\/\/# sourceMappingURL=.+/, `//# sourceMappingURL=${hashedMapBasename}`)
            .replace(
              /\/\*# sourceMappingURL=.+?\*\//,
              `/*# sourceMappingURL=${hashedMapBasename} */`,
            );
          fs.writeFileSync(hashedAbsPath, contents);
        }
      });

      fs.writeFileSync(path.join(dist, 'rev-manifest.json'), JSON.stringify(manifest, null, 2));

      logger.ok(`hashed ${files.length} file(s) in ${elapsed()}`);
      done();
    })().catch((error) => {
      reportTaskError(grunt, 'rev', error);
      done();
    });
  });
};
