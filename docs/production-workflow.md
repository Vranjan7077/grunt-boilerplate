# Production Workflow

```sh
npm run build
```

Produces a fully optimized `dist/`: minified CSS/JS/HTML, optimized images and SVGs, content-hashed filenames, rewritten references, and pre-compressed `.gz`/`.br` siblings. See [Tasks: grunt build pipeline](tasks.md#grunt-build-pipeline) for the exact task order and why it's ordered that way.

## Cache busting

`rev` content-hashes every CSS/JS/image file in `dist/` (8-char hash by default, `config.cacheBusting.hashLength`), renames it (`main.css` → `main.a1b2c3d4.css`), and writes `dist/rev-manifest.json`:

```json
{
  "/css/main.css": "/css/main.a1b2c3d4.css",
  "/js/main.js": "/js/main.e5f6a7b8.css"
}
```

`revreplace` then rewrites every reference to those original paths — in HTML attributes and CSS `url()` — against the manifest. This runs before `htmlmin`, so minification is the last step that touches file content.

Sourcemaps carry their hash along too: if `main.css` becomes `main.a1b2c3d4.css`, its sourcemap becomes `main.a1b2c3d4.css.map`, and the file's own `sourceMappingURL` comment (when not `hidden`) is rewritten to match.

Disable this entirely by setting `cacheBusting.enabled: false` in `config/environments/production.js` — useful if your host already handles cache invalidation another way.

## Compression

`compress` pre-compresses every HTML/CSS/JS/SVG/JSON/TXT file in `dist/` to `.gz` and `.br` siblings using Node's built-in `zlib` — no dependency, no external CLI. Point your static host at serving these directly instead of compressing per-request:

- **nginx**: `gzip_static on;` and `brotli_static on;` (if the Brotli module is installed).
- **Netlify / Vercel / most CDNs**: usually detect and serve pre-compressed siblings automatically, or check their docs for a manual header rule.

Disable via `compression.enabled: false` if your host doesn't support serving pre-compressed files.

## Deploying `dist/`

`dist/` is a fully static site — upload it as-is to any static host (Netlify, Vercel, S3+CloudFront, GitHub Pages, nginx). There's nothing server-side required beyond serving static files (and optionally the pre-compressed siblings above).
