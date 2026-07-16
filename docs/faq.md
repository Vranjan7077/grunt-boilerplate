# FAQ

**Why Grunt, not Vite/Webpack/gulp?**
Because you asked for a Grunt boilerplate. More seriously: Grunt's config-driven, task-based model is still a legitimate choice for static/marketing/docs sites that don't need a dev-server-with-HMR-and-a-framework-plugin-ecosystem — it stays out of your way, and this boilerplate pairs it with modern tools (esbuild, browser-sync, PostCSS) for the parts where Grunt's own plugin ecosystem has gone stale.

**Why LESS instead of Sass/SCSS?**
No technical superiority claim — it's the stated goal of this project. LESS's native mixins, guards, and `each()` loops cover the same ground as Sass's `@mixin`/`@if`/`@each`, and this architecture (see [LESS Architecture](less-architecture.md)) is built around LESS's actual strengths rather than a straight port of a Sass 7-1 pattern.

**Why esbuild instead of webpack or Rollup?**
Speed and dependency footprint. esbuild bundles this project's JS in double-digit milliseconds, has native ESM and TypeScript support, and its Node API is small enough to wrap directly in ~40 lines rather than depending on a Grunt plugin. Rollup remains a better fit if you're publishing a library with careful tree-shaking requirements — nothing here stops you from swapping it in.

**Why browser-sync instead of `grunt-contrib-connect` + LiveReload?**
CSS injection without a full page reload, multi-device sync, and a network-accessible URL out of the box. The classic connect+watch+LiveReload stack only does full-page reloads.

**Can I use this with React/Vue/a framework?**
Not directly — there's no JSX/SFC compilation wired in, and the HTML pipeline assumes static pages with `@@include` partials, not a component-based router. It's aimed at static sites, marketing pages, docs sites, and pattern libraries. If you need a framework, esbuild's `loader` options make JSX support straightforward to add to `grunt/tasks/esbuild.js`, but that's genuinely a different kind of project.

**Is TypeScript supported?**
Not by default, to keep the initial dependency count down — but esbuild (already the JS bundler here) understands `.ts` natively. See [Customization: TypeScript](customization.md#typescript) for the short path to enabling it.

**Why isn't there a CSS framework (Tailwind, Bootstrap) included?**
The LESS architecture in `src/less/` _is_ the design system — variables, mixins, components, and generated utilities. Bringing in a second framework on top would mostly duplicate it. Nothing stops you from replacing `src/less/` wholesale if you'd rather start from Tailwind or Bootstrap's LESS/CSS.

**Why is `dist/rev-manifest.json` itself gzip/brotli-compressed?**
It's not meant to be served to browsers — it's just swept up by the `compress` task's blanket `.json` glob along with genuinely useful files like any JSON you ship as a static asset. Harmless, if you'd rather exclude it, narrow the glob in `grunt/tasks/compress.js`.
