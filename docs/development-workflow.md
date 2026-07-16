# Development Workflow

## Starting out

```sh
npm install
npm run dev
```

This cleans `.tmp/`, runs every task once, starts browser-sync, and opens your browser to the served URL (default `http://localhost:3000` — browser-sync will pick the next free port if that's taken, and tells you which one it used). From here, saving any file under `src/` triggers exactly the tasks that file affects — see the watch table in [Tasks](tasks.md#grunt-dev-pipeline).

LESS changes are injected without a page reload. HTML and JS changes trigger a full reload.

## Adding a new page

1. Create `src/html/pages/your-page.html`, following `index.html`'s structure (`@@include` the shared `head.html`/`header.html`/`footer.html` partials).
2. Link to it from wherever makes sense (`header.html`'s nav, or another page).
3. Save — `includereplace:dev` resolves it and browser-sync reloads.

## Adding a new JS entry point

Each file in `src/js/entries/` becomes its own bundle, output under the same name (`src/js/entries/checkout.js` → `js/checkout.js`). Shared code goes in `src/js/modules/` and is imported normally (`import { x } from '../modules/y.js'`) — esbuild bundles it in.

## Adding a new component

See [LESS Architecture: adding a new component](less-architecture.md#adding-a-new-component).

## What happens when something breaks

`grunt dev` is deliberately fail-soft: a LESS syntax error, a bad esbuild import, an invalid include path — any of these get logged clearly with the failing task's name, and the watch loop keeps running. Fix the file, save again, and the next rebuild picks it up. You should never need to restart `grunt dev` because of a typo.

This does **not** apply to `grunt build`, `grunt lint`, or `grunt test` — those fail hard (non-zero exit) on the same errors, which is what makes CI trustworthy. See [Architecture: error handling](architecture.md#error-handling-strategy) for why this is keyed off which task you ran, not an environment variable.

## Dev server details

Browser-sync serves `.tmp/` (not `src/` directly — HTML includes and LESS need to be resolved first). Port, `open`, and `https` are all configurable in `config/default.js` under `devServer`.
