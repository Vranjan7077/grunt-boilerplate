# Architecture

## The core split: `config/` vs `grunt/`

Everything a day-to-day user might want to change lives in `config/`. Everything that implements _how_ the build works lives in `grunt/`. This is the single most important structural decision in this boilerplate — it's what lets you change the dev server port, enable cache-busting, or adjust browser targets without ever opening a file under `grunt/`.

```
config/
  paths.js               source/output directory map — the only place path strings live
  default.js              feature flags & tunables (sourcemaps, dev server, image quality...)
  environments/
    development.js         overrides applied when NODE_ENV=development
    production.js           overrides applied when NODE_ENV=production
  index.js                 merges default + environment, freezes the result

grunt/
  tasks/                  one file per custom task, each wraps a library's Node API directly
  config/                 one file per grunt-contrib-*/plugin options block
  aliases.js               grunt.registerTask sequencing — dev, build, lint, format, test
  utils/                  logger.js, timer.js, error-handler.js, env.js
```

`config/index.js` is required exactly once, produces a single frozen object, and every task config and custom task reads from it. Nothing hardcodes a path or a flag anywhere else.

## Gruntfile.js is a bootstrap, not a config file

`Gruntfile.js` itself is intentionally thin. It:

1. Resolves `NODE_ENV` (via `grunt/utils/env.js`) before anything else is required.
2. Requires `config/index.js`.
3. Auto-requires every file in `grunt/config/*.js`, calling each with `(grunt, config)` and feeding the result into `grunt.initConfig`.
4. Loads the small, explicit list of `grunt-contrib-*`/plugin tasks via `grunt.loadNpmTasks`.
5. Auto-requires every file in `grunt/tasks/*.js`, letting each register itself.
6. Requires `grunt/aliases.js` to wire up `dev`, `build`, `lint`, `format`, `test`.

Adding a new custom task never means editing `Gruntfile.js` — drop a file in `grunt/tasks/`, it's picked up automatically.

## Why some tasks are custom instead of grunt-contrib-*

`grunt-contrib-clean`, `-copy`, `-watch`, `-less`, and `-htmlmin` are used as-is — they're actively maintained and there's no value in reimplementing them. Everything else is a custom task in `grunt/tasks/` that wraps a modern library's own Node API directly:

- **esbuild, browser-sync** — no mature, actively-maintained Grunt plugin wraps these well; a ~40-line task calling their API directly is simpler than debugging a stale wrapper.
- **PostCSS** — `grunt-postcss` is pinned to `postcss@6`, which throws `is not a PostCSS plugin` against current `autoprefixer`/`cssnano` (which ship `postcss@8`). Wrapping PostCSS's own API sidesteps the version mismatch entirely.
- **Image optimization** — `grunt-contrib-imagemin`'s upstream `imagemin` core is stagnant and has ESM-interop issues from a CommonJS Gruntfile. `sharp` (raster) and `svgo` (vector) are used directly instead.
- **ESLint, Stylelint, html-validate** — wrapping each tool's own Node API guarantees compatibility with whatever version is installed, rather than lagging behind a Grunt plugin's release cycle (this mattered concretely for ESLint's flat config).
- **rev / rev-replace / compress** — small enough (content hashing, reference rewriting, gzip/brotli) that `crypto`, `zlib`, and `fast-glob` cover it without another dependency.

The one deliberate exception is `grunt/tasks/format.js`, which shells out to the Prettier CLI rather than its lower-level API — Prettier's CLI already does glob resolution, `.prettierignore` handling, and parser detection, and reimplementing that would be pure duplication.

## Error handling strategy

Every custom task funnels failures through `grunt/utils/error-handler.js`'s `reportTaskError(grunt, scope, error)`, which checks `isWatchMode()` (from `grunt/utils/env.js`):

- **Not watch mode** (`build`, `lint`, `test`, `format:check` — anything one-shot): `grunt.fail.fatal` — non-zero exit, stops immediately. This is what makes CI trustworthy.
- **Watch mode** (`grunt dev`): `grunt.fail.warn`, combined with `grunt.option('force', true)` set in `Gruntfile.js` only when `dev` is the requested task. The error is logged clearly but the watch loop keeps running — you fix a typo and save again instead of restarting the dev server.

This is keyed off _which task was requested on the CLI_, not `NODE_ENV` — an earlier version of this logic accidentally kept `--force` on for `grunt lint` too, which would have made lint failures pass silently in CI. Watch this distinction if you touch `grunt/utils/env.js`.

## Logging

`grunt/utils/logger.js` wraps `grunt.log` so every custom task's output is prefixed consistently (`[esbuild]`, `[rev]`, `[stylelint]`...) instead of every task inventing its own format. `grunt/utils/timer.js` gives each task a one-line way to report how long it took (`123ms` / `1.24s`).

## Naming conventions

- Grunt task names are lowercase, no separators (`optimizeimages`, `htmlvalidate`, `revreplace`) — this matches how `grunt-contrib-*` names its own tasks and avoids ambiguity with Grunt's `task:target` colon syntax.
- LESS partials are prefixed with `_` (a convention borrowed from Sass, not a LESS language feature) and every folder has an `_index.less` that imports its siblings in the order that matters.
- Config files are one-per-concern: `grunt/config/less.js` configures `grunt-contrib-less`, `grunt/tasks/esbuild.js` implements the `esbuild` task — the split is always "data" vs "code" for that same task name.
