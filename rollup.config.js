const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const { readFileSync } = require('fs');

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * Released under the ${pkg.license} License.
 */`;

const babelConfig = {
  babelHelpers: 'bundled',
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env', {
      targets: '> 1%, last 2 versions, not dead'
    }]
  ]
};

module.exports = [
  {
    input: 'src/epsgooglepay.js',
    output: {
      file: 'epsgooglepay.js',
      format: 'iife',
      name: 'EpsGooglePay',
      banner
    },
    context: 'window',
    plugins: [nodeResolve(), babel(babelConfig)]
  },
  {
    input: 'src/epsgooglepay.js',
    output: {
      file: 'dist/epsgooglepay.min.js',
      format: 'umd',
      name: 'EpsGooglePay',
      banner
    },
    context: 'window',
    plugins: [nodeResolve(), babel(babelConfig), terser()]
  }
];