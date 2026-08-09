// Real import of the modular TS source (transformed by babel-jest) so
// Istanbul instruments actual executed code — not a require of a bundled
// artifact and not a string-eval of source text.
const { VqDigitalWalletGoogle } = require('../src/index');

if (!VqDigitalWalletGoogle) {
  throw new Error('VqDigitalWalletGoogle not found after loading module');
}

describe('VqDigitalWalletGoogle', () => {
  let googlePayInstance;
  let validConfig;

  beforeEach(() => {
    validConfig = {
      environment: 'TEST',
      gateway: 'example',
      merchantId: '12345678901234567890',
      merchantName: 'Test Merchant',
      gatewayMerchantId: 'test_merchant_123',
      allowedCardNetworks: ['MASTERCARD', 'VISA'],
      allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
    };
  });

  afterEach(() => {
    if (googlePayInstance && typeof googlePayInstance.destroy === 'function') {
      googlePayInstance.destroy();
    }
    googlePayInstance = null;
  });

  describe('Initialization', () => {
    test('should create instance with valid config', () => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
      expect(googlePayInstance).toBeDefined();
      expect(googlePayInstance.config.environment).toBe('TEST');
    });

    test('should throw error with invalid environment', () => {
      const invalidConfig = { ...validConfig, environment: 'INVALID' };
      expect(() => VqDigitalWalletGoogle(invalidConfig)).toThrow('Invalid environment');
    });

    test('should throw error with missing merchantId', () => {
      const invalidConfig = { ...validConfig, merchantId: '' };
      expect(() => VqDigitalWalletGoogle(invalidConfig)).toThrow('merchantId is required');
    });

    test('should throw error with invalid merchantId format', () => {
      const invalidConfig = { ...validConfig, merchantId: 'invalid-id!' };
      expect(() => VqDigitalWalletGoogle(invalidConfig)).toThrow('merchantId format appears invalid');
    });
  });

  describe('Validation Functions', () => {
    beforeEach(() => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
    });

    test('should validate payment data correctly', () => {
      const validPaymentData = {
        amount: 100.50,
        currency: 'ZAR',
        countryCode: 'ZA',
        transactionId: 'test-transaction-123'
      };

      expect(() => googlePayInstance.validatePaymentData(validPaymentData)).not.toThrow();
    });

    test('should reject invalid amount', () => {
      const invalidPaymentData = {
        amount: -10,
        currency: 'ZAR'
      };

      expect(() => googlePayInstance.validatePaymentData(invalidPaymentData))
        .toThrow('Amount must be between 0.01 and 999999.99');
    });

    test('should reject invalid currency', () => {
      const invalidPaymentData = {
        amount: 100,
        currency: 'XYZ'
      };

      expect(() => googlePayInstance.validatePaymentData(invalidPaymentData))
        .toThrow('Invalid or unsupported currency code');
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
    });

    test('should encode and decode base64 correctly', () => {
      const testData = '{"test":"data"}';
      const encoded = googlePayInstance.encodePayloadToBase64(testData);
      const decoded = googlePayInstance.decodePayloadFromBase64(encoded);

      expect(decoded).toEqual(JSON.parse(testData));
    });

    test('should generate valid transaction ID', () => {
      const transactionId = googlePayInstance.generateTransactionId();
      expect(transactionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should manage session token', () => {
      const testToken = 'test-token-123';
      googlePayInstance.storeSessionToken(testToken);
      expect(googlePayInstance.getSessionToken()).toBe(testToken);
      
      googlePayInstance.clearSessionToken();
      expect(googlePayInstance.getSessionToken()).toBeNull();
    });
  });

  describe('Google Pay Integration', () => {
    beforeEach(() => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
    });

    test('should initialize Google Pay successfully', async () => {
      const result = await googlePayInstance.initialize();
      expect(result).toBe(true);
      expect(googlePayInstance.isReadyToPay).toBe(true);
    });

    test('should build payment data request correctly', () => {
      const paymentData = {
        amount: 100,
        currency: 'ZAR',
        countryCode: 'ZA'
      };

      const request = googlePayInstance.buildPaymentDataRequest(paymentData);
      
      expect(request.apiVersion).toBe(2);
      expect(request.transactionInfo.totalPrice).toBe('100');
      expect(request.transactionInfo.currencyCode).toBe('ZAR');
      expect(request.merchantInfo.merchantId).toBe(validConfig.merchantId);
    });

    test('should create and mount a Google Pay button once ready', async () => {
      await googlePayInstance.initialize();

      const button = googlePayInstance.createButton('google-pay-button', {
        amount: 100,
        currency: 'ZAR'
      });

      expect(button).toBeDefined();
      expect(button.tagName).toBe('BUTTON');
      expect(document.getElementById).toHaveBeenCalledWith('google-pay-button');
    });

    test('should throw when creating a button before initialize()', () => {
      expect(() => {
        googlePayInstance.createButton('google-pay-button', { amount: 100, currency: 'ZAR' });
      }).toThrow('Google Pay is not ready. Call initialize() first.');
    });

    test('should warn with a specific message when CRYPTOGRAM_3DS is the only auth method and readiness is false', async () => {
      const instance = VqDigitalWalletGoogle({ ...validConfig, allowedCardAuthMethods: ['CRYPTOGRAM_3DS'] });
      await instance.initialize();
      instance.paymentsClient.isReadyToPay.mockResolvedValueOnce({ result: false });

      await instance.checkReadyToPay();

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('CRYPTOGRAM_3DS requires device/card network support'));
    });

    test('should warn with the generic message when readiness is false for other reasons', async () => {
      await googlePayInstance.initialize();
      googlePayInstance.paymentsClient.isReadyToPay.mockResolvedValueOnce({ result: false });

      await googlePayInstance.checkReadyToPay();

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('not available on this device/browser'));
    });

    test('should log a targeted hint when readiness check fails with a merchantId error', async () => {
      await googlePayInstance.initialize();
      googlePayInstance.paymentsClient.isReadyToPay.mockRejectedValueOnce(new Error('invalid merchantId'));

      const result = await googlePayInstance.checkReadyToPay();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('VqDigitalWalletGoogle: Check your merchantId configuration');
    });

    test('should surface initialize() failure when constructing the payments client throws', async () => {
      const instance = VqDigitalWalletGoogle(validConfig);
      const original = global.google.payments.api.PaymentsClient;
      global.google.payments.api.PaymentsClient = jest.fn(() => {
        throw new Error('client construction failed');
      });

      await expect(instance.initialize()).rejects.toThrow('client construction failed');

      global.google.payments.api.PaymentsClient = original;
    });

    test('should propagate requestPayment failure and clear the session token', async () => {
      await googlePayInstance.initialize();
      googlePayInstance.paymentsClient.loadPaymentData.mockRejectedValueOnce(new Error('payment declined'));
      googlePayInstance.storeSessionToken('stale-token');

      await expect(googlePayInstance.requestPayment({ amount: 50, currency: 'ZAR' })).rejects.toThrow('payment declined');

      expect(googlePayInstance.getSessionToken()).toBeNull();
    });

    test('destroy() should clear session token, payments client, and readiness state', async () => {
      await googlePayInstance.initialize();
      googlePayInstance.storeSessionToken('some-token');

      googlePayInstance.destroy();

      expect(googlePayInstance.getSessionToken()).toBeNull();
      expect(googlePayInstance.paymentsClient).toBeNull();
      expect(googlePayInstance.isReadyToPay).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
    });

    test('should log errors correctly', () => {
      const testError = new Error('Test error');
      const errorInfo = googlePayInstance.logError('Test message', testError, 'test');
      
      expect(errorInfo.message).toBe('Test message');
      expect(errorInfo.error).toBe('Test error');
      expect(errorInfo.context).toBe('test');
      expect(console.error).toHaveBeenCalled();
    });

    test('should handle rate limiting', () => {
      // Reset rate limiting before test
      googlePayInstance.checkRateLimit(); // First call
      
      // Simulate multiple rapid requests
      expect(() => {
        for (let i = 0; i < 4; i++) {
          googlePayInstance.checkRateLimit();
        }
      }).toThrow('Too many payment requests');
    });
  });

  describe('Debug Information', () => {
    test('should have loaded VqDigitalWalletGoogle correctly', () => {
      expect(VqDigitalWalletGoogle).toBeDefined();
      expect(typeof VqDigitalWalletGoogle).toBe('function');
      expect(VqDigitalWalletGoogle.version).toBeDefined();
    });

    test('should create instance without new keyword', () => {
      const instance = VqDigitalWalletGoogle(validConfig);
      expect(instance).toBeDefined();
      expect(instance.constructor).toBe(VqDigitalWalletGoogle);
    });
  });

  describe('Security', () => {
    // CWE-79: XSS — gateway containing HTML/script tags must be rejected
    test('should reject XSS characters in gateway (CWE-79)', () => {
      const xssConfig = { ...validConfig, gateway: '<script>alert(1)</script>' };
      expect(() => VqDigitalWalletGoogle(xssConfig)).toThrow('gateway contains invalid characters');
    });

    // CWE-79: XSS — gatewayMerchantId with injection chars must be rejected
    test('should reject XSS characters in gatewayMerchantId (CWE-79)', () => {
      const xssConfig = { ...validConfig, gatewayMerchantId: '"><img src=x onerror=alert(1)>' };
      expect(() => VqDigitalWalletGoogle(xssConfig)).toThrow('gatewayMerchantId contains invalid characters');
    });

    // CWE-116: merchantName dangerous chars are stripped (sanitiseConfigString)
    test('should sanitise dangerous characters from merchantName (CWE-116)', () => {
      const dirtyConfig = { ...validConfig, merchantName: '<b>Test & "Merchant"</b>' };
      googlePayInstance = VqDigitalWalletGoogle(dirtyConfig);
      expect(googlePayInstance.config.merchantName).not.toContain('<');
      expect(googlePayInstance.config.merchantName).not.toContain('>');
      expect(googlePayInstance.config.merchantName).not.toContain('"');
      expect(googlePayInstance.config.merchantName).not.toContain('&');
    });

    // CWE-400: Oversized merchantName must be truncated to 100 chars max
    test('should truncate oversized merchantName to 100 characters (CWE-400)', () => {
      const longName = 'A'.repeat(500);
      googlePayInstance = VqDigitalWalletGoogle({ ...validConfig, merchantName: longName });
      expect(googlePayInstance.config.merchantName.length).toBeLessThanOrEqual(100);
    });

    // CWE-400: gateway exceeding 64 chars must be rejected
    test('should reject gateway longer than 64 characters (CWE-400)', () => {
      const longGateway = 'a'.repeat(65);
      expect(() => VqDigitalWalletGoogle({ ...validConfig, gateway: longGateway }))
        .toThrow('gateway contains invalid characters');
    });

    // CWE-1321: Prototype pollution — __proto__ key in config must not pollute Object.prototype
    test('should block prototype pollution via __proto__ config key (CWE-1321)', () => {
      // JSON.parse creates an object with __proto__ as an own enumerable property
      const malicious = JSON.parse(
        '{"environment":"TEST","gateway":"example","merchantId":"12345678901234567890",' +
        '"merchantName":"Test","gatewayMerchantId":"test123",' +
        '"allowedCardNetworks":["VISA"],"allowedCardAuthMethods":["PAN_ONLY"],' +
        '"__proto__":{"polluted":true}}'
      );
      try { VqDigitalWalletGoogle(malicious); } catch (e) { /* validation may throw */ }
      expect(({}).polluted).toBeUndefined();
    });

    // CWE-20: Null config must throw rather than crash silently
    test('should throw when config is null (CWE-20)', () => {
      expect(() => VqDigitalWalletGoogle(null)).toThrow();
    });

    // CWE-20: Empty config must throw — missing required fields
    test('should throw when config is an empty object (CWE-20)', () => {
      expect(() => VqDigitalWalletGoogle({})).toThrow();
    });

    // CWE-20: Invalid buttonColor must be rejected
    test('should reject invalid buttonColor (CWE-20)', () => {
      expect(() => VqDigitalWalletGoogle({ ...validConfig, buttonColor: 'purple' }))
        .toThrow('Invalid buttonColor');
    });

    // CWE-20: Invalid buttonType must be rejected
    test('should reject invalid buttonType (CWE-20)', () => {
      expect(() => VqDigitalWalletGoogle({ ...validConfig, buttonType: 'invalid' }))
        .toThrow('Invalid buttonType');
    });

    // CWE-20: scriptLoadTimeout must be a positive number
    test('should reject non-positive scriptLoadTimeout (CWE-20)', () => {
      expect(() => VqDigitalWalletGoogle({ ...validConfig, scriptLoadTimeout: 0 }))
        .toThrow('scriptLoadTimeout must be a positive number');
      expect(() => VqDigitalWalletGoogle({ ...validConfig, scriptLoadTimeout: -1 }))
        .toThrow('scriptLoadTimeout must be a positive number');
    });

    // CWE-20: Empty allowedCardNetworks must be rejected
    test('should reject empty allowedCardNetworks array (CWE-20)', () => {
      expect(() => VqDigitalWalletGoogle({ ...validConfig, allowedCardNetworks: [] }))
        .toThrow('allowedCardNetworks must be a non-empty array');
    });

    // CWE-400: Clearly malformed Base64 must be rejected by decodePayloadFromBase64
    test('should reject clearly invalid Base64 input on decode (CWE-400)', () => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
      expect(() => googlePayInstance.decodePayloadFromBase64('!!!not-base64!!!'))
        .toThrow('Invalid base64 encoded payload');
    });

    // CWE-400: Non-JSON Base64 content must throw on decode (JSON.parse fails)
    test('should throw when decoded Base64 content is not valid JSON (CWE-400)', () => {
      googlePayInstance = VqDigitalWalletGoogle(validConfig);
      // btoa('not json') = valid base64 that decodes to non-JSON text
      const nonJsonBase64 = Buffer.from('this is not json').toString('base64');
      expect(() => googlePayInstance.decodePayloadFromBase64(nonJsonBase64))
        .toThrow('Failed to decode base64 payload');
    });

    // CWE-770: Rate limit must be per-instance, not shared across instances
    test('rate limit should be isolated per instance and not shared (CWE-770)', () => {
      const instanceA = VqDigitalWalletGoogle(validConfig);
      const instanceB = VqDigitalWalletGoogle(validConfig);

      // Exhaust instanceA rate limit
      instanceA.checkRateLimit();
      instanceA.checkRateLimit();
      instanceA.checkRateLimit();
      expect(() => instanceA.checkRateLimit()).toThrow('Too many payment requests');

      // instanceB must be completely unaffected
      expect(() => instanceB.checkRateLimit()).not.toThrow();

      instanceA.destroy();
      instanceB.destroy();
    });
  });
});