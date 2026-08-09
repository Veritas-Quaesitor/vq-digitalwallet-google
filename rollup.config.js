const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const { readFileSync } = require('fs');

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const production = process.env.NODE_ENV !== 'development';

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * Released under the ${pkg.license} License.
 */`;

// Single build target: this repository is distributed as one GitHub-hosted
// browser script served from docs/ via GitHub Pages (Settings > Pages >
// Source > main /docs), matching the sibling vq-digitalwallet-apple SDK's
// convention.
module.exports = {
  input: 'src/browser-global.ts',
  output: {
    file: 'docs/vq-google-pay.js',
    format: 'iife',
    // No `name` here deliberately: src/browser-global.ts performs its own
    // explicit `window.VqDigitalWalletGoogle = VqDigitalWalletGoogle`
    // assignment (the real constructor) to preserve the exact original
    // contract. Rollup's IIFE wrapper assigns its *entire return value* to
    // `window[name]` as its final step when `name` is set — since it runs
    // after the module body, it silently overwrites a manual mid-module
    // assignment with the whole exports namespace object instead of the
    // constructor. This was a real, shipped defect in an earlier pass of
    // this exact engagement: `new window.VqDigitalWalletGoogle()` threw
    // "is not a function" for every real consumer. Do not add `name` back
    // without re-verifying in a real browser (test/built-artifact.test.js
    // guards against this regressing silently).
    sourcemap: false,
    banner
  },
  context: 'window',
  plugins: [
    nodeResolve({ extensions: ['.js', '.ts'] }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts'],
      presets: [
        ['@babel/preset-env', { targets: '> 1%, last 2 versions, not dead' }],
        '@babel/preset-typescript'
      ]
    }),
    ...(production ? [terser()] : [])
  ]
};
