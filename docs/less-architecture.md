# LESS Architecture

`src/less/main.less` is the single entry point. It imports each layer in order, and the order is load-bearing — later layers use variables, mixins, and tokens defined by earlier ones:

```
settings → functions → mixins → base → layout → components → utilities → themes → vendor-overrides
```

| Folder              | Purpose                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings/`         | Variables only: colors, typography scale, spacing scale, breakpoints, z-index scale, and `_tokens.less` (see below). Nothing here outputs CSS on its own except `_tokens.less`.                     |
| `functions/`        | LESS has no first-class return-value functions like Sass. The convention here is a mixin that assigns its result to a predictable variable name (`.rem(24px); font-size: @rem;`) — see `_rem.less`. |
| `mixins/`           | Reusable behavior: `.respond-to()`, `.visually-hidden()`, `.truncate()`, `.flex-center()`/`.flex-between()`, `.button-variant()`.                                                                   |
| `base/`             | Reset + default element styling (`_reset.less`, `_typography.less`). No classes, just element selectors.                                                                                            |
| `layout/`           | Structural, reusable across pages: `.container`, `.grid` (with a `.grid-col-1`..`.grid-col-12` set generated via `each(range(1, 12), {...})`).                                                      |
| `components/`       | One file per UI component (`_buttons.less`, `_cards.less`, `_forms.less`, `_nav.less`).                                                                                                             |
| `utilities/`        | Single-property utility classes, generated from the shared spacing scale via `each(@spacing-scale, {...})` rather than hand-written.                                                                |
| `themes/`           | Runtime theme overrides — see below.                                                                                                                                                                |
| `vendor-overrides/` | Empty on purpose. The escape hatch for overriding a third-party stylesheet's rules without fighting specificity elsewhere.                                                                          |

## The CSS custom-property bridge

`settings/_tokens.less` is the one place this architecture meaningfully departs from a typical Sass-ported structure. It re-exposes the color and font-family LESS variables as CSS custom properties:

```less
:root {
  --color-primary: @color-primary;
  --color-text: @color-text;
  /* ... */
}
```

Components consume `var(--color-text)` rather than `@color-text` directly wherever the value might reasonably change per-theme. `themes/_dark.less` then only overrides the custom properties, scoped under `[data-theme="dark"]`:

```less
[data-theme='dark'] {
  --color-text: #f2f3f5;
  --color-background: #14161a;
  /* ... */
}
```

Flip `<html data-theme="dark">` at runtime (a JS toggle, no rebuild needed) and every component using `var(--color-*)` updates instantly. Purely structural values — spacing, breakpoints, z-index — stay as plain LESS variables, since they don't need to change at runtime and compiling them away is cheaper than a custom property lookup.

## `each()` is a function, not a mixin

This tripped us up once during development: LESS's `each()` is a built-in **function**, called without a leading dot (`each(@list, {...})`), not a mixin (`.each(...)`). Writing `.each(...)` parses as a call to an undefined mixin named `each` and fails with `.each is undefined`. Both loops in this codebase (`layout/_grid.less`, `utilities/_spacing.less`) use the correct function form.

## Adding a new component

1. Create `src/less/components/_your-component.less`.
2. Add `@import '_your-component';` to `src/less/components/_index.less`.
3. Add a section to `src/html/pages/patterns.html` showing it against real markup — this page doubles as the project's living style guide/pattern library.

## Adding a new theme

Add `src/less/themes/_your-theme.less` following `_dark.less`'s pattern (override custom properties under a `[data-theme="..."]` selector), then `@import` it from `themes/_index.less`.
