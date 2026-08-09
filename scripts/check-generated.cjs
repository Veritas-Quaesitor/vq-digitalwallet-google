"use strict";

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const artifact = "docs/vq-google-pay.js";

if (!fs.existsSync(path.join(root, artifact))) {
  throw new Error(`Missing generated browser SDK: ${artifact}`);
}
execFileSync("git", ["diff", "--exit-code", "--", artifact], {
  cwd: root,
  stdio: "inherit",
});
process.stdout.write("Committed hosted SDK artifact is current.\n");
