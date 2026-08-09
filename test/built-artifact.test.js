// Verifies the exact committed, hosted deliverable — not src/. Source-level
// tests alone missed a real defect in an earlier pass of this engagement:
// rollup's `output.name` option silently overwrote window.VqDigitalWalletGoogle
// (set correctly by src/browser-global.ts) with the whole exports namespace
// object, making `new VqDigitalWalletGoogle()` throw "is not a function" for
// every real consumer of the hosted script. See rollup.config.js for the fix.
//
// Uses indirect eval, not `new Function('window', code)`: a Function body's
// top-level `var` is local to that function, so it never touches a `window`
// parameter passed in — it does NOT reproduce how a real <script> tag's
// top-level `var` becomes a global property. Indirect eval executes in the
// realm's actual global scope (== `window` under jest-environment-jsdom),
// which does reproduce it. Empirically verified against the reintroduced
// bug before trusting this construction.
const fs = require('fs');
const path = require('path');

const ARTIFACT_PATH = path.join(__dirname, '../docs/vq-google-pay.js');
const indirectEval = eval;

afterEach(() => {
  delete window.VqDigitalWalletGoogle;
});

describe('Built artifact (the exact hosted script consumers load)', () => {
  test('artifact exists', () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
  });

  test('window.VqDigitalWalletGoogle is the constructor function, not a namespace object', () => {
    const code = fs.readFileSync(ARTIFACT_PATH, 'utf8');
    indirectEval(code);

    expect(typeof window.VqDigitalWalletGoogle).toBe('function');
  });

  test('the constructor works end to end when loaded as a real global script', () => {
    const code = fs.readFileSync(ARTIFACT_PATH, 'utf8');
    indirectEval(code);

    const instance = new window.VqDigitalWalletGoogle({
      environment: 'TEST',
      gateway: 'example',
      merchantId: '12345678901234567890',
      merchantName: 'Test Merchant',
      gatewayMerchantId: 'test_merchant_123'
    });

    expect(instance.version).toBe(window.VqDigitalWalletGoogle.version);
    expect(typeof instance.generateTransactionId()).toBe('string');
  });
});
