# Local playground

A small Vite + React consumer of the package in this repository. It is private, is not part of the npm tarball, and does not require publishing agree-first.

## Run it

Use Node 20.19+ or 22.12+ (the Vite requirement). From the repository root:

```bash
npm ci
npm run build
cd apps/playground
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173/`). Visit `/unstyled.html` for the page that imports no package stylesheet. If you change the library source, rebuild the root package and restart Vite; the playground consumes the root package's built `dist` through a local `file:` dependency.

## Manual checks

1. In the simple flow, open both links in a new tab, check the box, inspect the payload, then reload. It should remain checked from localStorage.
2. Switch Terms from v1.0 to v1.1. The box should require acceptance again. Clear the local record and repeat.
3. In the review flow, open the modal, use mouse/touch/keyboard scrolling, wait for the first document's 1.5-second timer, finish both tabs, and click **Continue demo**. Inspect the callback payload.
4. Close and reopen with Escape; check focus restoration. Try Tab, Shift+Tab, arrow keys on tabs, mobile width, zoom, and light/dark system themes.
5. Try **Open short document**: it should become available without scrolling. Visit `/unstyled.html` to confirm the custom theme works without `agree-first/styles`.
6. Check the browser console. The linked pages are sample content, not legal documents.

The playground uses React 19 for interactive testing. The library's CI separately tests React 18 and 19. To test the exact published artifact, follow the tarball smoke-test steps in the root `RELEASING.md`.
