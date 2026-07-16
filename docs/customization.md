# Customization

## Changing paths, ports, browser targets, etc.

Almost everything is in `config/default.js` and `config/environments/*.js` — see [Configuration](configuration.md) for the full list. You should rarely need to touch anything under `grunt/` for a day-to-day change.

## Adding a new Grunt task

- **Wraps a `grunt-contrib-*` plugin or similar**: add `grunt/config/your-task.js` exporting `(grunt, config) => ({ ...targets })`, add the plugin name to the `CONTRIB_PLUGINS` list in `Gruntfile.js`, and wire it into `grunt/aliases.js`.
- **Custom logic**: add `grunt/tasks/your-task.js` exporting `(grunt, config) => { grunt.registerTask('yourtask', ..., function () {...}) }` — it's auto-loaded, no `Gruntfile.js` edit needed. Wire it into `grunt/aliases.js` if it should run as part of `dev`/`build`/`lint`.

## Removing something you don't need

Every task is independent — delete the file under `grunt/config/` or `grunt/tasks/`, remove it from `grunt/aliases.js`, and uninstall the npm package if nothing else depends on it. Nothing else in the codebase assumes a specific task exists.

## Swapping `grunt-include-replace` for real templating

`@@include(...)` covers includes and variable substitution, deliberately not loops or conditionals. If a project needs more, swap it for [Nunjucks](https://mozilla.github.io/nunjucks/): replace `grunt/config/includereplace.js` and the `includereplace` task references with a custom task rendering `.njk` templates via Nunjucks' Node API — the rest of the pipeline (postcss, esbuild, rev, etc.) doesn't care what produced the HTML.

## Recipes for deferred features

These were deliberately left out of the default install to keep the dependency count and build complexity low — add them only if you actually need them.

### TypeScript

esbuild already understands `.ts`/`.tsx` natively — no bundler change needed.

1. Point a `src/js/entries/*.ts` file instead of `.js` — `grunt/tasks/esbuild.js`'s glob (`*.js`) needs widening to `*.{js,ts}`.
2. Add `typescript` as a devDependency and a `tsconfig.json`.
3. Add a `grunt/tasks/typecheck.js` running `tsc --noEmit` (esbuild strips types but doesn't check them) and wire it into `grunt lint`.

### Critical CSS

Add [`critters`](https://github.com/GoogleChromeLabs/critters) or [`critical`](https://github.com/addyosmani/critical) as a devDependency and a custom task that runs after `htmlmin:build`, inlining above-the-fold CSS into each page's `<head>` and deferring the full stylesheet. Gate it behind a `config.criticalCss.enabled` flag, same pattern as `cacheBusting`/`compression`.

### RTL support

LESS's `.each()`/guards make a directional mixin straightforward: add a `@direction: ltr;` variable in `settings/`, and a mixin like `.padding-start(@value)` that resolves to `padding-left`/`padding-right` based on it. For a fully separate RTL stylesheet instead, add a second `grunt-contrib-less` target compiling `main.less` with a `@direction: rtl;` override (LESS supports overriding a variable via the `modifyVars` option) into `css/main.rtl.css`.

### Accessibility checks

Add [`@axe-core/cli`](https://www.npmjs.com/package/@axe-core/cli) as a devDependency (it pulls in a Chromium download, which is why it's not installed by default) and a custom task that spawns it against the built `dist/` pages via `child_process`. Wire it into `grunt lint` behind a `config.a11y.enabled` flag.

### Commitlint + Commitizen

```sh
npm install -D @commitlint/cli @commitlint/config-conventional commitizen cz-conventional-changelog
```

Add `commitlint.config.js` extending `@commitlint/config-conventional`, a `.husky/commit-msg` hook running `npx --no -- commitlint --edit "$1"`, and a `"config": { "commitizen": { "path": "cz-conventional-changelog" } }` entry in `package.json` if you want `git cz` as a guided commit prompt.
