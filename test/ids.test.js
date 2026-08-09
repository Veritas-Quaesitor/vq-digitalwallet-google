const { generateTransactionId } = require('../src/core/ids');

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateTransactionId', () => {
  test('uses crypto.randomUUID when available (fast path)', () => {
    const id = generateTransactionId();
    expect(id).toMatch(UUID_V4);
  });

  test('falls back to crypto.getRandomValues when randomUUID is unavailable', () => {
    const original = global.crypto.randomUUID;
    delete global.crypto.randomUUID;

    const id = generateTransactionId();

    expect(id).toMatch(UUID_V4);
    global.crypto.randomUUID = original;
  });

  test('falls back to Math.random when the crypto API is entirely unavailable', () => {
    const original = global.crypto;
    // eslint-disable-next-line no-global-assign
    delete global.crypto;

    const id = generateTransactionId();

    expect(id).toMatch(UUID_V4);
    global.crypto = original;
  });
});
