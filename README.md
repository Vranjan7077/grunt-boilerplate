# Grunt + LESS Boilerplate

An original, production-ready [Grunt](https://gruntjs.com/) build system for static sites, marketing pages, docs sites, and pattern libraries — built around **LESS**, [esbuild](https://esbuild.github.io/), and [browser-sync](https://browsersync.io/).

This isn't a copy of an existing Grunt starter. It has its own architecture, its own opinions about which parts of the Grunt plugin ecosystem are worth keeping (`grunt-contrib-clean`/`-copy`/`-watch`/`-less`/`-htmlmin`) versus reimplementing directly against a modern library's own API (esbuild, browser-sync, PostCSS, sharp, svgo, ESLint, Stylelint) — see [`docs/architecture.md`](docs/architecture.md) for the reasoning behind every one of those calls.

## Why this exists

Most Grunt boilerplates are either 2013-era relics built on deprecated plugins and Sass, or kitchen-sink dumps of every `grunt-contrib-*` package with no opinion about which ones still deserve to be there. This project picks a side: a lean core, a single `config/` surface for everything you'd normally want to change, fail-loud production builds and fail-soft dev watching, and a LESS architecture designed around what LESS is actually good at (see [`docs/less-architecture.md`](docs/less-architecture.md)) rather than a straight port of a Sass pattern.

## Quick start

```sh
npm install
npm run dev
```

That's it — `npm run dev` starts a live-reloading dev server at `http://localhost:3000` (browser-sync will tell you if it had to pick a different port). Save any file under `src/` and watch it rebuild.

```sh
npm run build   # production build → dist/
npm run lint    # ESLint + Stylelint + html-validate
npm run format  # Prettier, project-wide
npm test        # lint + a real build-validation test suite
```

## Requirements

- Node.js 20+ (see `.nvmrc`)
- npm

## Folder structure

```text
config/        user-facing settings — paths, feature flags, environment overrides
grunt/         task orchestration — custom tasks, plugin configs, aliases
src/
  html/          pages + @@include partials
  less/          settings → functions → mixins → base → layout → components → utilities → themes
  js/            ES module entries + shared modules, bundled by esbuild
  images/        raster + SVG, optimized on build via sharp/svgo
  fonts/         copied as-is
  static/        favicon, robots.txt, etc — copied as-is
dist/          production output (gitignored)
.tmp/          dev output (gitignored)
```

## Documentation

| Doc                                                            | Covers                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`docs/architecture.md`](docs/architecture.md)                 | The `config/` vs `grunt/` split, why each custom task exists, error handling, logging |
| [`docs/configuration.md`](docs/configuration.md)               | Every setting in `config/`, what it controls                                          |
| [`docs/less-architecture.md`](docs/less-architecture.md)       | The LESS folder structure, the CSS-custom-property theming bridge, adding components  |
| [`docs/tasks.md`](docs/tasks.md)                               | Every Grunt task, what it wraps, the full `dev`/`build` pipelines                     |
| [`docs/development-workflow.md`](docs/development-workflow.md) | Day-to-day `grunt dev` usage                                                          |
| [`docs/production-workflow.md`](docs/production-workflow.md)   | Cache busting, compression, deploying `dist/`                                         |
| [`docs/customization.md`](docs/customization.md)               | Adding tasks, swapping tools, recipes for TypeScript/Critical CSS/RTL/a11y/Commitlint |
| [`docs/troubleshooting.md`](docs/troubleshooting.md)           | Known gotchas and how they're handled                                                 |
| [`docs/faq.md`](docs/faq.md)                                   | Why Grunt, why LESS, why esbuild, why browser-sync                                    |
| [`docs/contributing.md`](docs/contributing.md)                 | Branching, commits, releases                                                          |

## License

MIT
