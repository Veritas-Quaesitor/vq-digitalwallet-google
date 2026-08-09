"use strict";

// Project-native equivalent of the sibling vq-digitalwallet-apple SDK's
// scripts/check-browser-build.cjs: runs the exact committed hosted script in
// an isolated Node vm context (as close to a real <script> tag's top-level
// scope as Node offers) and asserts the exported global's exact shape, plus
// a byte-size budget. Complements test/built-artifact.test.js, which uses
// jsdom's window instead — both exist because they catch different classes
// of regression (this one is closer to Node's own module/global semantics;
// the jest one runs inside the actual jsdom environment other tests share).

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const file = path.join(__dirname, "..", "docs", "vq-google-pay.js");
const source = fs.readFileSync(file, "utf8");

// Apple Pay's sibling budget is 35 KiB for a richer domain (display items,
// shipping options, merchant validation transport). Google Pay's surface is
// smaller — single-amount payment requests, no merchant-validation
// transport layer — so a smaller budget is the evidence-backed choice here,
// not a copy of the sibling's number. Current build measures ~11 KiB;
// budget leaves real headroom for growth, not padding to match Apple Pay's.
const maximumBytes = 20 * 1024;
const actualBytes = fs.statSync(file).size;

const context = { console, setTimeout, clearTimeout, document: { createElement: () => ({}), head: { appendChild: () => {} }, getElementById: () => null } };
// A real browser's top-level `window` *is* the global object — self-
// reference it the same way, so `typeof window !== 'undefined'` (the
// script's own runtime-detection guard) is true and the global-attach
// branch actually executes, exactly as it would for a real <script> tag.
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "vq-google-pay.js" });

assert.equal(typeof context.VqDigitalWalletGoogle, "function", "browser global was not attached, or was overwritten with a non-function value (see rollup.config.js output.name history)");
assert.deepEqual(
  Object.keys(context.VqDigitalWalletGoogle).sort(),
  ["defaults", "fn", "version"],
  "browser global's static surface does not match the documented API"
);
assert.equal(context.VqDigitalWalletGoogle.version, require(path.join(__dirname, "..", "package.json")).version, "browser global version drifted from package.json");
assert.ok(actualBytes <= maximumBytes, `browser SDK is ${(actualBytes / 1024).toFixed(1)} KiB; budget is ${(maximumBytes / 1024).toFixed(0)} KiB`);

process.stdout.write(`Browser SDK exposes the documented API at ${(actualBytes / 1024).toFixed(1)} KiB / ${(maximumBytes / 1024).toFixed(0)} KiB.\n`);
