"use strict";

// Project-native equivalent of the engineer-sdk skill's check_metadata.py +
// check_boundaries.py + check_docs.py, combined into one script matching the
// sibling vq-digitalwallet-apple SDK's actual check-source.cjs item for item
// (see architecture notes for the literal enumeration). Written as a Node
// script, not the bundled Python tools, for the same reason the sibling did:
// this is a Node/TS repo and its own CI already runs Node.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pkg = require(path.join(root, "package.json"));
const lock = require(path.join(root, "package-lock.json"));
const versionSource = read("src/version.ts");
const loaderSource = read("src/browser/google-pay-sdk-loader.ts");
const changelog = read("CHANGELOG.md");
const index = read("docs/index.html");
const demo = read("docs/demo.html");
const readme = read("README.md");
const escapedVersion = pkg.version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// --- Metadata agreement ---
assert.match(pkg.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/, "version is not SemVer");
assert.equal(pkg.private, true, "tooling package must remain private");
assert.equal(pkg.publishConfig, undefined, "npm publish configuration is not allowed");
assert.equal(lock.version, pkg.version, "lockfile version drifted");
assert.equal(lock.packages[""].version, pkg.version, "lockfile root version drifted");
assert.match(versionSource, new RegExp(`SDK_VERSION = '${escapedVersion}'`), "SDK_VERSION drifted");
// Accepts either an exact version heading or "[Unreleased]": bumping the
// release number is a release-policy decision this script does not make
// (version-neutrality) — it only requires that *some* changelog entry
// exists to describe the current working tree, not that it claims a
// specific unapproved version number.
assert.match(changelog, new RegExp(`^## \\[(?:Unreleased|${escapedVersion})\\]`, "m"), "changelog is missing an Unreleased or current-version entry");

// --- Hosted script identity ---
const scriptUrl = loaderSource.match(/GOOGLE_PAY_SCRIPT_URL\s*=\s*'([^']+)'/)?.[1];
assert.equal(scriptUrl, "https://pay.google.com/gp/p/js/pay.js", "Google Pay script URL drifted");
// No SRI/version-pin assertion here, unlike the sibling's Apple Pay JS
// check: Google does not publish a versioned or content-hash-stable URL
// for this script (investigated against Google's own docs; the exact
// script-loading code sample did not render in a plain-text fetch, so this
// is corroborated by the well-established unchanged nature of this URL
// across the ecosystem, not a direct doc citation — see CHANGELOG.md).

// --- Active docs describe the shipped contract ---
assert.match(index, new RegExp(escapedVersion), "docs landing version drifted");
assert.match(index, /vq-google-pay\.js/, "docs landing does not name the SDK");
assert.match(demo, /<script src="\.\/vq-google-pay\.js"><\/script>/, "demo does not load the SDK");
assert.match(readme, /btoa\(JSON\.stringify\(rawGooglePayToken\)\)|Token = `btoa/, "README does not document the payment wire contract");
assert.match(readme, /veritas-quaesitor\.github\.io\/vq-digitalwallet-google\/vq-google-pay\.js/, "README lacks the hosted URL");
assert.doesNotMatch(
  [index, demo, readme].join("\n"),
  /npm install vq-digitalwallet-google|unpkg\.com|vqdigitalwalletgoogle\.js|noConflict/,
  "active docs contain retired guidance"
);

// --- Browser globals stay behind their boundary ---
const sourceRoot = path.join(root, "src");
const allowedGlobals = new Set([
  "browser-global.ts",
  "browser/google-pay-sdk-loader.ts",
  "browser/environment.ts",
  "ui/button.ts"
]);
const sourceFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : entry.name.endsWith(".ts") ? [file] : [];
  });
const violations = sourceFiles(sourceRoot).flatMap((file) => {
  const modulePath = path.relative(sourceRoot, file).replaceAll("\\", "/");
  if (allowedGlobals.has(modulePath)) return [];
  return read(file.slice(root.length + 1))
    .split(/\r?\n/)
    .flatMap((line, indexValue) => (/\b(?:window|document)\b/.test(line) ? [`${modulePath}:${indexValue + 1}`] : []));
});
assert.deepEqual(violations, [], `browser globals escaped their boundary: ${violations.join(", ")}`);

process.stdout.write(`Source, metadata, documentation, and browser boundaries are coherent for ${pkg.version}.\n`);
