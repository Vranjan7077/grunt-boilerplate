# Configuration

Everything in this section lives under `config/`. You should never need to edit anything under `grunt/` to change one of these values.

## How it's resolved

1. `grunt/utils/env.js` inspects `process.argv` (before anything else runs) to decide `NODE_ENV`:
   - `--env=production` / `--env=development` on the CLI wins if present.
   - Otherwise, running the `build` or `test` task implies `production`; everything else (including `dev`) is `development`.
2. `config/index.js` deep-merges `config/default.js` with `config/environments/{development,production}.js` based on that `NODE_ENV`, then freezes the result.
3. Every task config (`grunt/config/*.js`) and custom task (`grunt/tasks/*.js`) receives this same object.

## `config/paths.js`

The single source of truth for every directory the build touches (`src.html`, `src.less`, `src.js`, `dist`, `tmp`, etc). Paths are exported with forward slashes even on Windows — this matters because several tasks build glob patterns via string interpolation (`` `${paths.src.less}/**/*.less` ``), and a few glob engines don't handle a backslash/forward-slash mix reliably.

## `config/default.js`

| Key                                         | Controls                                                                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `sourceMaps`                                | `true`, `false`, or `'hidden'` (map file written, but no `sourceMappingURL` reference — matches esbuild's `external` mode) |
| `autoprefixer.browsers`                     | Browserslist query passed to autoprefixer                                                                                  |
| `esbuild.{target,format,minify,bundle}`     | Passed straight through to esbuild's `build()` call                                                                        |
| `minify.{html,css,js}`                      | Gates htmlmin/cssnano/esbuild minification                                                                                 |
| `devServer.{port,open,https,notify}`        | Passed to `browserSync.init()`                                                                                             |
| `cacheBusting.{enabled,hashLength}`         | Gates the `rev`/`revreplace` tasks                                                                                         |
| `compression.{enabled,algorithms}`          | Gates the `compress` task; `algorithms` is `['gzip', 'brotli']`                                                            |
| `imageOptimization.{jpeg,png,webp}.quality` | Passed to sharp                                                                                                            |
| `htmlValidate.enabled`                      | Gates the `htmlvalidate` task                                                                                              |

## `config/environments/`

`development.js` and `production.js` only need to list the keys that differ from `default.js`. Production currently overrides: `sourceMaps: 'hidden'`, `esbuild.minify: true`, `minify.{html,css,js}: true`, `cacheBusting.enabled: true`, `compression.enabled: true`.

## Adding your own config

If you need a new tunable, add it to `config/default.js` (with a sensible default) and override it per-environment only where it actually differs. Then read it from `config.yourNewKey` in whichever `grunt/config/*.js` or `grunt/tasks/*.js` file needs it — don't hardcode the value at the call site.
