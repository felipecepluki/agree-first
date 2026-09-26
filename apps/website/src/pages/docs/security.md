---
layout: ../../layouts/DocsLayout.astro
title: Security & trust
description: Understand the security boundary of agree-first, protect agreement records, and report vulnerabilities privately.
---

# Security & trust

`agree-first` manages an agreement **UI and client-side state**. It does not authenticate a user, prevent someone from changing browser state, or turn an acceptance payload into cryptographic proof. Treat every value sent by a browser as untrusted.

## What the package does—and does not do

The package has no runtime dependencies beyond its React peer dependencies. It does not fetch document URLs, send records to a server, or execute third-party document HTML on its own. The default document links open in a new tab with `rel="noopener noreferrer"`.

An `AcceptPayload` contains a client-generated ID, a browser-generated timestamp, document metadata, optional user-agent text, and scroll-completion indexes. None of those fields is a signature, a trustworthy clock, proof of reading, or an anti-bot measure. Scroll and minimum display time are UI review requirements, not security controls.

## If an agreement matters to your backend

1. Authenticate the request in your application. Do not accept a user ID supplied only inside a client payload.
2. On the server, compare the submitted document URLs and versions against the **current versions you control**. The browser's document list alone is not authoritative.
3. Validate the payload's shape and apply your own rules before saving. Record a server-side receipt time and associate the accepted versions with the authenticated account. Keep the client timestamp as optional context, not your only timestamp.
4. Decide how your product handles a failed save, retries, and revocation. `onAccept` updates the UI before an asynchronous server write completes; the library does not confirm persistence or revoke a record.

Client-side checks can improve the experience, but they can be bypassed; security decisions require [server-side validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html). The library does not determine whether an agreement is legally valid.

## Browser storage and document content

`storageKey` saves a record in `localStorage` for convenience on that browser. Other scripts running on the same origin can read or change it, and the person using the browser can edit it. Do not use it as an authorization check or as the only durable record. Do not put secrets in an acceptance payload or its storage key; see [OWASP's guidance on local storage](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage).

Choose document URLs from sources you trust; do not pass an unvalidated user-supplied URL into a link. For the optional review modal, `content` is React content supplied by your application. If your application renders untrusted HTML there, sanitize it before rendering and follow [OWASP's XSS guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html). `agree-first` does not sanitize application content or monitor the page behind a document URL.

## Package and vulnerability reporting

Install a known package version and keep your application's lockfile. Review updates and run your normal dependency checks; zero runtime dependencies reduces the package's dependency surface but does not eliminate security risk. The release process checks tests, TypeScript, package exports, and tarball contents. Those checks are quality gates, not a security certification.

If you find a potential vulnerability in `agree-first`, use [GitHub's private vulnerability report](https://github.com/felipecepluki/agree-first/security/advisories) and include the affected version and reproduction steps. Do **not** post exploit details in a public issue. See the repository's [security policy](https://github.com/felipecepluki/agree-first/blob/main/SECURITY.md) for the support scope.
