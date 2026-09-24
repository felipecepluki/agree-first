# Contributing to agree-first

Thanks for helping improve agree-first. Keep changes focused and explain the user-visible behavior they affect. Bug reports and small pull requests are welcome; please use [the security policy](SECURITY.md) instead of a public issue for vulnerabilities.

## Local development

Use Node.js 20 or newer for development (CI runs on Node 20) and npm with the committed lockfile. The published package supports Node.js 18 or newer.

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run size:report
npm run lint:package
npm run check:package
npm pack --dry-run
```

Run the checks after changes to code or package metadata. The size report is informational, not a pass/fail threshold. Add tests for behavior that can regress; avoid tests that only increase coverage numbers.

## Scope and review

- Preserve the existing public API unless a change has been discussed and justified.
- Keep React as a peer dependency, CSS optional, and runtime dependencies at zero unless there is a compelling reason to add one.
- Include accessibility and keyboard behavior in UI changes. Keep documentation and examples accurate; do not claim that scroll completion proves reading or legal compliance.
- Prefer small, understandable changes over new abstractions, entrypoints, or a larger architecture.

Issues and discussions can cover bugs, usage, and documentation. This project does not provide legal advice or a compliance guarantee, and maintainers cannot promise a response time.

## Publishing

Maintainers own npm publication, release credentials, and release decisions. Contributors should not publish the package or include secrets in pull requests. A passing pull request is not itself a release.
