// Load your IIFE module
const fs = require('fs');
const path = require('path');

// Read and execute your IIFE
const moduleCode = fs.readFileSync(path.join(__dirname, '../src/epsgooglepay.js'), 'utf8');

// Create a complete mock global environment
const mockWindow = {
  google: global.google,
  btoa: global.btoa,
  atob: global.atob,
  crypto: global.crypto,
  document: global.document,
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  console: global.console,
  Promise: global.Promise,
  Date: global.Date,
  Math: global.Math,
  Array: global.Array,
  Object: global.Object,
  JSON: global.JSON,
  Error: global.Error,
  TypeError: global.TypeError
};

// Execute the IIFE and capture EpsGooglePay
let EpsGooglePay;
try {
  // Create a proper execution context
  const executeCode = new Function('window', 'global', 'document', 'console', 'setTimeout', 'clearTimeout', 'btoa', 'atob', 'crypto', 'Promise', 'Date', 'Math', 'Array', 'Object', 'JSON', 'Error', 'TypeError', `
    ${moduleCode}
    return window.EpsGooglePay;
  `);
  
  EpsGooglePay = executeCode(
    mockWindow,
    mockWindow,
    mockWindow.document,
    mockWindow.console,
    mockWindow.setTimeout,
    mockWindow.clearTimeout,
    mockWindow.btoa,
    mockWindow.atob,
    mockWindow.crypto,
    mockWindow.Promise,
    mockWindow.Date,
    mockWindow.Math,
    mockWindow.Array,
    mockWindow.Object,
    mockWindow.JSON,
    mockWindow.Error,
    mockWindow.TypeError
  );
} catch (error) {
  console.error('Failed to load EpsGooglePay module:', error);
  throw error;
}

if (!EpsGooglePay) {
  throw new Error('EpsGooglePay not found after loading module');
}

describe('EpsGooglePay', () => {
  let googlePayInstance;
  let validConfig;

  beforeEach(() => {
    validConfig = {
      environment: 'TEST',
      gateway: 'example',
      merchantId: 'BCR2DN4T23YWKJHG',
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
      googlePayInstance = EpsGooglePay(validConfig);
      expect(googlePayInstance).toBeDefined();
      expect(googlePayInstance.config.environment).toBe('TEST');
    });

    test('should throw error with invalid environment', () => {
      const invalidConfig = { ...validConfig, environment: 'INVALID' };
      expect(() => EpsGooglePay(invalidConfig)).toThrow('Invalid environment');
    });

    test('should throw error with missing merchantId', () => {
      const invalidConfig = { ...validConfig, merchantId: '' };
      expect(() => EpsGooglePay(invalidConfig)).toThrow('merchantId is required');
    });

    test('should throw error with invalid merchantId format', () => {
      const invalidConfig = { ...validConfig, merchantId: 'invalid-id!' };
      expect(() => EpsGooglePay(invalidConfig)).toThrow('merchantId format appears invalid');
    });
  });

  describe('Validation Functions', () => {
    beforeEach(() => {
      googlePayInstance = EpsGooglePay(validConfig);
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
        currency: 'USD'
      };

      expect(() => googlePayInstance.validatePaymentData(invalidPaymentData))
        .toThrow('Invalid or unsupported currency code');
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      googlePayInstance = EpsGooglePay(validConfig);
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
      googlePayInstance = EpsGooglePay(validConfig);
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
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      googlePayInstance = EpsGooglePay(validConfig);
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
    test('should have loaded EpsGooglePay correctly', () => {
      expect(EpsGooglePay).toBeDefined();
      expect(typeof EpsGooglePay).toBe('function');
      expect(EpsGooglePay.version).toBeDefined();
    });

    test('should create instance without new keyword', () => {
      const instance = EpsGooglePay(validConfig);
      expect(instance).toBeDefined();
      expect(instance.constructor).toBe(EpsGooglePay);
    });
  });
});