# agree-first website

The public-facing landing page and initial documentation for agree-first. This is a separate, private Astro app; the publishable React package remains at the repository root, and this site is excluded from the npm tarball.

## Run locally

Astro 7 requires Node 22.12 or later. The site uses the published `agree-first@0.2.0` package for its live examples. From the repository root:

```bash
npm ci
cd apps/website
npm ci
npm run dev
```

Open the URL printed by Astro. `npm run check` validates Astro/TypeScript source. `npm run build` runs that check and generates a static site in `dist/`; `npm run preview` serves the build locally. No deployment target or domain is configured yet.

## Content

- `src/pages/index.astro`: landing page.
- `src/components/AgreementDemo.tsx`: React island on the homepage, demonstrating versioned re-acceptance in the simple flow with the published package. The optional review flow is explained in the docs.
- `src/components/docs/`: interactive React examples and their Preview/Code shell for selected documentation pages.
- `src/pages/docs/*.md` and `*.mdx`: documentation pages, one route per file.
- `src/layouts/`: shared site shell and docs navigation.
- `src/styles/`: site-owned CSS.

Documentation code blocks adapt the MIT-licensed [Code Blocks](https://github.com/pheralb/code-blocks) component pattern to Astro's static Markdown output. The installation block offers npm, pnpm, Yarn, and Bun commands; all fenced code examples have a copy control. This site-specific enhancement uses no shadcn or Tailwind setup and does not affect the published library.

Most documentation pages remain static. Selected MDX pages hydrate small React examples through the official Astro integration; the homepage demo also hydrates React. These site examples use the pinned npm release, while the separate Vite playground in `apps/playground` is better suited to testing unpublished library changes. When library behavior changes, update the README and matching website docs in the same change, then update the site's pinned version when a matching release exists. Avoid claims of proof of reading or automatic legal compliance.
