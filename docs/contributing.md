# Contributing

## Requirements

- Node.js 20+ (see `.nvmrc`)
- npm

## Getting set up

```sh
npm install
npm run dev
```

`npm install` also runs `husky` via the `prepare` script, wiring up the pre-commit hook (`.husky/pre-commit`), which runs `lint-staged` — ESLint/Stylelint with `--fix`, then Prettier, scoped to whatever you've staged.

## Before opening a PR

```sh
npm run lint
npm run format:check
npm run build
npm test
```

All four run in CI (`.github/workflows/ci.yml`) across Ubuntu, Windows, and macOS on Node 20 — a PR won't merge cleanly if any of them fail on any platform.

## Branch strategy

Trunk-based: short-lived branches (`feat/*`, `fix/*`, `chore/*`) off `master`, `master` always releasable. No long-running development branches.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) style is recommended (`feat: add dark mode toggle`, `fix: correct grid gap on mobile`) even though it isn't enforced by tooling out of the box — this keeps the door open to adding `commitlint`/`semantic-release` later with zero friction. See [Customization: Commitlint + Commitizen](customization.md#commitlint--commitizen) if you want to enforce it.

## Releases

Manual `npm version` + a `CHANGELOG.md` in [Keep a Changelog](https://keepachangelog.com/) format. No automated release tooling is wired in by default, to keep the dependency count down — `semantic-release` or `changesets` are both reasonable additions if a project needs fully automated releases.

## Adding a new task or config option

See [Customization](customization.md#adding-a-new-grunt-task) — the short version is: config changes go in `config/`, new behavior goes in a new file under `grunt/tasks/` or `grunt/config/`, and both are auto-loaded without touching `Gruntfile.js`.
