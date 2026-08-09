describe('browser-global entry point', () => {
  test('attaches window.VqDigitalWalletGoogle as a side effect of import', () => {
    jest.resetModules();
    delete window.VqDigitalWalletGoogle;

    require('../src/browser-global');

    expect(typeof window.VqDigitalWalletGoogle).toBe('function');
  });

  test('exposes the documented static surface', () => {
    jest.resetModules();
    delete window.VqDigitalWalletGoogle;

    require('../src/browser-global');

    expect(typeof window.VqDigitalWalletGoogle.version).toBe('string');
    expect(window.VqDigitalWalletGoogle.defaults).toBeDefined();
  });
});
