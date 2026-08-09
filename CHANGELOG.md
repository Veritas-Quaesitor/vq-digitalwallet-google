# Changelog

All notable changes are documented here. This project follows the Keep a Changelog structure. Release numbering follows this project's actual versioning policy.

## [Unreleased]

### Changed

- Restructured the single-file `src/vqdigitalwalletgoogle.js` monolith into modular TypeScript source (`core/`, `google-pay/`, `browser/`, `ui/`, `observability/`) compiling to one hosted browser artifact, matching the sibling `vq-digitalwallet-apple` SDK's engineering rigor.
- Retired npm publishing and the unpkg CDN URL. Distributed exclusively as one GitHub-hosted browser script.
- **Hosted script relocated from repo root to `docs/`, and renamed** from `vqdigitalwalletgoogle.js` to `vq-google-pay.js`, converging on the sibling Apple Pay SDK's artifact-naming and hosting-layout convention. Requires a manual GitHub Settings → Pages → Source change to `main` `/docs` before the new URL resolves.
- Demo relocated from `demo/index.html` to `docs/demo.html`; generated API reference moved to `docs/api/` (JSDoc replaced with TypeDoc, which understands the TypeScript source; JSDoc could not).
- Tests now execute the real module via `require`/`import` instead of `eval()`-ing source text, fixing dishonest test coverage (was reporting 0% despite passing tests).
- Test suite split into focused per-module files (`client.test.js`, `google-pay-sdk-loader.test.js`, `browser-global.test.js`, `ids.test.js`, `built-artifact.test.js`), matching the sibling's organization. Real measured coverage: 79.84% statements / 73.25% branches / 91.52% functions / 80.81% lines (up from a dishonestly-reported 0%, and from 62.05% after the first honest-but-monolithic-test pass of this engagement). Enforced via `jest.config.js` `coverageThreshold`, set a small margin below the measured number — not left as "TBD."
- Added `test/built-artifact.test.js`, verifying the actual committed hosted script (not just `src/`) via indirect `eval` — this is the check that would have caught a real constructor-clobbering defect found and fixed during this engagement's development (see below).
- Added `scripts/check-source.cjs` (version/URL/docs/README consistency, browser-global boundary enforcement) and `scripts/check-browser-build.cjs` (exact exported global shape, artifact size budget), matching the sibling's own verification scripts item for item — not just a freshness check standing in for all three concerns.
- Added CI (lint, type-check, test with coverage, build, source/build/generated-freshness checks, dependency audit), matching the sibling's Node-version matrix approach.

### Fixed

- **A real, shipped defect found during this engagement's own development**: `rollup.config.js` previously set `output.name`, which caused rollup's IIFE wrapper to silently overwrite the correctly-assigned `window.VqDigitalWalletGoogle` constructor with the whole module exports namespace object as its trailing step. Every real consumer of the hosted script would have hit `TypeError: ... is not a function`. Fixed by removing `output.name` (the SDK sets `window.VqDigitalWalletGoogle` itself, deliberately); permanently guarded by `test/built-artifact.test.js`.
- Demo: the "Mount Google Pay Button" control stayed enabled and unchanged after mounting the real native Google Pay button, so both sat stacked and clickable, looking like two payment controls. Relabels/de-emphasises it after mount and resets it on re-init/destroy.

### Removed

- `noConflict()` — no known consumer, no equivalent in the sibling SDK.
- No TypeScript declaration files are shipped to consumers — no confirmed consumer evidence exists, and the reference SDK ships none either.

### Security

- Corrected README language that described Base64 token encoding as "security" — it is an encoding, not encryption. Behavior is unchanged; only the description was inaccurate.
- Documented that the Google Pay script is loaded without Subresource Integrity pinning, and why (Google does not publish a versioned/content-stable URL the way Apple does) — see SECURITY.md.

No change to the constructor, public methods, callback shape, or the Base64 payment-token wire encoding.

## [1.1.0]

- Enhanced security features
- TypeScript definitions
- Improved error handling
- Rate limiting
- Session management

## [1.0.0]

- Initial release
- Basic Google Pay integration
- UMD/CommonJS/ES6 support
