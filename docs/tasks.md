# Available Tasks

## Entry points (what you actually run)

| Command                                       | Does                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev` / `grunt dev`                   | Clean `.tmp/`, build everything once, start browser-sync, then watch for changes. Never exits on its own.                  |
| `npm run build` / `grunt build`               | Clean `dist/`, build everything for production: minified, hashed, pre-compressed.                                          |
| `npm run lint` / `grunt lint`                 | `includereplace:dev` (so HTML validation sees resolved markup) → `htmlvalidate` → `eslint` → `stylelint`.                  |
| `npm run format` / `grunt format`             | `prettier --write .`                                                                                                       |
| `npm run format:check` / `grunt format:check` | `prettier --check .` — what CI runs.                                                                                       |
| `npm test` / `grunt test`                     | `lint`, then the `node:test` build-validation suite (which itself runs a full production build and asserts on the output). |

## `grunt dev` pipeline

```
clean:tmp → less:dev → postcss:dev → esbuild:dev → includereplace:dev → copy:dev → browsersync → watch
```

`watch` then re-runs the relevant slice of that pipeline per file type, followed by `bsreload` (full reload) or `bsreload:css` (CSS injection, no page refresh):

| Watching                                   | Triggers                                  |
| ------------------------------------------ | ----------------------------------------- |
| `src/static/`, `src/fonts/`, `src/images/` | `copy:dev`, `bsreload`                    |
| `src/less/**/*.less`                       | `less:dev`, `postcss:dev`, `bsreload:css` |
| `src/html/**/*.html`                       | `includereplace:dev`, `bsreload`          |
| `src/js/**/*.js`                           | `esbuild:dev`, `bsreload`                 |

A failure in any of these during `grunt dev` is logged clearly but does **not** stop the watch loop — see [Architecture: error handling](architecture.md#error-handling-strategy).

## `grunt build` pipeline

```
clean:dist → less:build → postcss:build → esbuild:build → includereplace:build
  → optimizeimages → optimizesvg → rev → revreplace → htmlmin:build → copy:build → compress
```

The order matters: assets are optimized _before_ they're hashed (`rev`), references are rewritten (`revreplace`) _before_ HTML is minified (`htmlmin`), and compression runs last so the `.gz`/`.br` siblings reflect the final minified output.

## Task reference

| Task                      | Implementation                            | Notes                                                                                                                          |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `clean`                   | `grunt-contrib-clean`                     | `clean:dist`, `clean:tmp`                                                                                                      |
| `copy`                    | `grunt-contrib-copy`                      | `copy:dev` also copies unoptimized images (fast iteration); `copy:build` doesn't — `optimizeimages`/`optimizesvg` handle those |
| `less`                    | `grunt-contrib-less`                      | Compiles `src/less/main.less` → `css/main.css`, with sourcemaps                                                                |
| `postcss`                 | Custom (`grunt/tasks/postcss.js`)         | Autoprefixer always; cssnano only when `config.minify.css`                                                                     |
| `esbuild`                 | Custom (`grunt/tasks/esbuild.js`)         | Bundles every file in `src/js/entries/`; `grunt esbuild:dev` / `grunt esbuild:build`                                           |
| `includereplace`          | `grunt-include-replace`                   | Resolves `@@include('../partials/x.html', {...})` directives                                                                   |
| `htmlmin`                 | `grunt-contrib-htmlmin`                   | Build only; options are a no-op object when `config.minify.html` is false                                                      |
| `optimizeimages`          | Custom (`grunt/tasks/optimize-images.js`) | `sharp`, build only                                                                                                            |
| `optimizesvg`             | Custom (`grunt/tasks/optimize-svg.js`)    | `svgo`, build only                                                                                                             |
| `rev`                     | Custom (`grunt/tasks/rev.js`)             | Content-hashes CSS/JS/images, writes `dist/rev-manifest.json`                                                                  |
| `revreplace`              | Custom (`grunt/tasks/rev-replace.js`)     | Rewrites references against the manifest                                                                                       |
| `compress`                | Custom (`grunt/tasks/compress.js`)        | Pre-compresses `dist/` to `.gz`/`.br` via Node's built-in `zlib`                                                               |
| `browsersync`             | Custom (`grunt/tasks/browser-sync.js`)    | Starts the dev server; `bsreload` / `bsreload:css` trigger reload/injection                                                    |
| `watch`                   | `grunt-contrib-watch`                     | Only triggers tasks — never owns reloading itself                                                                              |
| `eslint`                  | Custom (`grunt/tasks/eslint.js`)          | Wraps ESLint's Node API directly                                                                                               |
| `stylelint`               | Custom (`grunt/tasks/stylelint.js`)       | Wraps Stylelint's Node API directly                                                                                            |
| `htmlvalidate`            | Custom (`grunt/tasks/html-validate.js`)   | Validates _resolved_ HTML (post-`includereplace`), not raw source                                                              |
| `format` / `format:check` | Custom (`grunt/tasks/format.js`)          | Shells out to the Prettier CLI (the one deliberate exception — see [Architecture](architecture.md))                            |
| `nodetest`                | Custom (`grunt/tasks/run-node-tests.js`)  | Runs `node --test`                                                                                                             |
