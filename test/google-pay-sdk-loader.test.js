const { loadGooglePayScript, GOOGLE_PAY_SCRIPT_URL } = require('../src/browser/google-pay-sdk-loader');

// The global test/setup.js mock replaces setTimeout with one that fires
// synchronously, which would make loadGooglePayScript's timeout reject
// before this file can ever exercise onload/onerror. Use real fake timers
// here instead so the timeout only fires when explicitly advanced.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  delete global.google;
});

describe('loadGooglePayScript', () => {
  test('resolves immediately if window.google.payments.api already exists', async () => {
    global.google = { payments: { api: { existing: true } } };

    const api = await loadGooglePayScript(5000);

    expect(api).toEqual({ existing: true });
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  test('injects a script tag pointing at the documented Google Pay URL', () => {
    loadGooglePayScript(5000).catch(() => {});

    const script = document.createElement.mock.results.find((r) => r.value.tagName === 'SCRIPT').value;
    expect(script.src).toBe(GOOGLE_PAY_SCRIPT_URL);
    expect(script.async).toBe(true);
    expect(document.head.appendChild).toHaveBeenCalledWith(script);
  });

  test('resolves with window.google.payments.api once the script loads successfully', async () => {
    const promise = loadGooglePayScript(5000);
    const script = document.createElement.mock.results.find((r) => r.value.tagName === 'SCRIPT').value;

    global.google = { payments: { api: { loaded: true } } };
    script.onload();

    await expect(promise).resolves.toEqual({ loaded: true });
  });

  test('rejects if the script loads but the API is not actually present', async () => {
    const promise = loadGooglePayScript(5000);
    const script = document.createElement.mock.results.find((r) => r.value.tagName === 'SCRIPT').value;

    script.onload();

    await expect(promise).rejects.toThrow('Google Pay API failed to load properly');
  });

  test('rejects when the script fails to load', async () => {
    const promise = loadGooglePayScript(5000);
    const script = document.createElement.mock.results.find((r) => r.value.tagName === 'SCRIPT').value;

    script.onerror();

    await expect(promise).rejects.toThrow('Failed to load Google Pay script from CDN');
  });

  test('rejects after the configured timeout elapses without load or error', async () => {
    const promise = loadGooglePayScript(1234);
    jest.advanceTimersByTime(1234);

    await expect(promise).rejects.toThrow('Google Pay script load timeout after 1234ms');
  });
});
