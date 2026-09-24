# Releasing agree-first

Releases are a maintainer decision and a manual operation. A green pull request is not permission to publish. Do not put npm credentials, one-time codes, or recovery codes in this repository or in issue comments.

## Ownership and access

Last checked on 2026-09-24: `npm owner ls agree-first` listed `felipecepluki`, `npm view agree-first version` returned `0.1.0`, and GitHub's private-vulnerability-reporting endpoint returned `enabled: true`. These are snapshots, not permanent guarantees. Before each release, the publisher must confirm `npm whoami` is an authorized owner, recheck `npm owner ls agree-first`, and confirm the [private security-reporting route](https://github.com/felipecepluki/agree-first/security/advisories) still works. The maintainer controls npm access, release credentials, version selection, and rollback decisions.

## Pre-release checklist

- [ ] Confirm the intended change, version number, and compatibility impact. Update `package.json` **and** `package-lock.json`; do not attempt to republish a version already on npm.
- [ ] Move relevant notes from `Unreleased` to a dated version in `CHANGELOG.md`. Keep README examples and release wording consistent with the actual behavior; do not claim proof of reading or automatic legal compliance.
- [ ] Review and commit the release metadata, confirm the working tree is clean, and confirm both React 18 and 19 CI jobs pass for the intended commit.
- [ ] On Node 20+, run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Run `npm run size:report` and compare ESM, optional CSS, and tarball sizes with the [README baseline](README.md#size-baseline). Investigate an unexplained increase; the report is informational, not a hard limit.
- [ ] Run `npm run lint:package`, `npm run check:package`, and `npm pack --dry-run`. Inspect the file list: root JS/types, optional CSS, README, changelog, license, and package metadata should be present; tests, secrets, `node_modules`, and local configuration should not.
- [ ] Create a tarball with `npm pack --pack-destination <temporary-directory>` and install that tarball in a disposable React consumer. Smoke-test imports from `agree-first` and `agree-first/styles`, the link-only agreement, version change/re-acceptance, and the optional review flow in a browser. Do not publish merely to test installation.
- [ ] Recheck npm ownership/authentication and the private security-reporting route. Only then decide whether to publish manually. Verify the resulting version and install it from npm in a clean consumer after publication.

`prepublishOnly` reruns tests, typecheck, build, publint, ATTW, and pack dry-run, but it does not replace the size review, CI check, or consumer smoke test. No automated release workflow, trusted publishing, or provenance is configured yet.

## If a release is wrong

Stop further promotion and identify the last known-good version. The maintainer decides whether to point the `latest` dist-tag back to it, deprecate the affected version with a clear message, and publish a corrected patch release. Check the registry result and tell users what to install. For a security issue, use the private advisory channel before public disclosure. Do not assume a published version can be overwritten, and do not unpublish as a routine rollback: removal can break existing consumers. See npm's [dist-tag](https://docs.npmjs.com/cli/commands/npm-dist-tag/), [deprecation](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/), and [unpublishing](https://docs.npmjs.com/unpublishing-packages-from-the-registry/) guidance before taking registry action.
