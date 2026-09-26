# agree-first website

The public-facing landing page and initial documentation for agree-first. This is a separate, private Astro app; the publishable React package remains at the repository root, and this site is excluded from the npm tarball.

## Run locally

Astro 7 requires Node 22.12 or later. The homepage demo imports the local library build. From the repository root:

```bash
npm ci
npm run build
cd apps/website
npm ci
npm run dev
```

Open the URL printed by Astro. `npm run check` validates Astro/TypeScript source. `npm run build` runs that check and generates a static site in `dist/`; `npm run preview` serves the build locally. No deployment target or domain is configured yet.

## Content

- `src/pages/index.astro`: landing page.
- `src/components/AgreementDemo.tsx`: one React island on the homepage, demonstrating the simple and optional review flows with the local built package (no npm publish needed).
- `src/pages/docs/*.md`: documentation pages, one route per file.
- `src/layouts/`: shared site shell and docs navigation.
- `src/styles/`: site-owned CSS.

Documentation code blocks adapt the MIT-licensed [Code Blocks](https://github.com/pheralb/code-blocks) component pattern to Astro's static Markdown output. The installation block offers npm, pnpm, Yarn, and Bun commands; all fenced code examples have a copy control. This site-specific enhancement uses no shadcn or Tailwind setup and does not affect the published library.

The documentation pages remain static. Only the homepage demo hydrates React, via the official Astro integration; it does not persist sample acceptance beyond a page reload. The separate, more complete Vite playground remains in `apps/playground`. Before deploying the site publicly, verify that the npm release matches the local package behavior shown in the demo. When library behavior changes, update the README and matching website docs in the same change. Avoid claims of proof of reading or automatic legal compliance.
