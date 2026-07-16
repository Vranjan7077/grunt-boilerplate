# Troubleshooting

## `npm install` prints deprecation warnings about `glob@7`, `rimraf@2`, `inflight`

These come from Grunt's own transitive dependency tree, not this boilerplate. They're long-standing, widely-known warnings in the Grunt ecosystem and don't affect functionality. `npm audit` will also flag a handful of vulnerabilities from the same source — there's currently no fix available short of Grunt itself updating its dependencies.

## Browser-sync starts on a different port than I configured

Browser-sync auto-increments to the next free port if the one in `config.devServer.port` is already in use (often a stray dev server from a previous run that didn't shut down cleanly). Check the terminal output — it always logs the actual URL it bound to.

## `grunt dev` seems stuck / doesn't reload after a change

Check the terminal for a red `[task-name]` error line — `grunt dev` logs failures but keeps watching rather than crashing (see [Architecture: error handling](architecture.md#error-handling-strategy)), so a silent failure in your LESS/JS/HTML is the most likely cause, not a broken watcher.

## `.each is undefined` when compiling LESS

You (or a copy-pasted mixin) wrote `.each(...)` instead of `each(...)`. LESS's `each()` is a built-in **function**, called without a leading dot — see [LESS Architecture](less-architecture.md#each-is-a-function-not-a-mixin).

## Stylelint flags things that look like valid LESS

The base `declaration-property-value-no-unknown` and `media-query-no-invalid` rules don't understand LESS math, function calls, or variables in media queries — `.stylelintrc.json` disables the core versions and enables `stylelint-less`'s LESS-aware replacement (`less/declaration-property-value-no-unknown`) where one exists. If you hit a new false positive, check whether `stylelint-less` has a rule for it before disabling the core one outright.

## Prettier and html-validate disagree about HTML style

Prettier's HTML formatter self-closes void elements (`<meta ... />`) and lowercases `<!doctype html>`. `html-validate:recommended`'s defaults expect the opposite. `.htmlvalidate.json` configures `void-style`/`doctype-style` to match what Prettier actually outputs — since Prettier re-formats on every commit (via lint-staged), the formatter's opinion has to win. If you change Prettier's HTML behavior, revisit these two rules.

## Cross-platform paths

`config/paths.js` normalizes every exported path to forward slashes, even on Windows — several tasks build glob patterns via string interpolation, and mixed separators break `fast-glob`/Stylelint's glob matching (though `grunt-contrib-watch`'s own file matching tolerates it). If you add a new path to `config/paths.js`, build it from existing forward-slash values rather than `path.join()`, which reintroduces the OS-native separator.
