// Mock Google Pay API
global.google = {
  payments: {
    api: {
      PaymentsClient: jest.fn().mockImplementation((config) => ({
        isReadyToPay: jest.fn().mockResolvedValue({ result: true }),
        loadPaymentData: jest.fn().mockResolvedValue({
          paymentMethodData: {
            tokenizationData: {
              token: '{"test":"token"}'
            }
          }
        }),
        createButton: jest.fn().mockReturnValue(document.createElement('button'))
      }))
    }
  }
};

// Mock crypto API for transaction ID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => '12345678-1234-4567-8901-123456789012'),
    getRandomValues: jest.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    })
  },
  writable: true
});

// Mock base64 functions
global.btoa = jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));
global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString('binary'));

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      style: {},
      onclick: null,
      onload: null,
      onerror: null
    };
    
    if (tagName === 'script') {
      element.src = '';
      element.async = false;
    }
    
    return element;
  }),
  writable: true
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: jest.fn()
  },
  writable: true
});

Object.defineProperty(document, 'getElementById', {
  value: jest.fn((id) => ({
    id: id,
    appendChild: jest.fn(),
    innerHTML: '',
    style: {}
  })),
  writable: true
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Mock setTimeout/clearTimeout
global.setTimeout = jest.fn((fn, delay) => {
  if (typeof fn === 'function') {
    fn();
  }
  return 123; // Mock timer ID
});

global.clearTimeout = jest.fn();

// Mock Date for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());
global.Date.prototype = Date.prototype;

// Mock Promise if needed
if (typeof Promise === 'undefined') {
  global.Promise = require('es6-promise').Promise;
}

// Setup test environment
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset DOM
  document.head.appendChild.mockClear();
  
  // Reset Google Pay mock
  if (global.google && global.google.payments && global.google.payments.api) {
    global.google.payments.api.PaymentsClient.mockClear();
  }
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});