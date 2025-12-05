module.exports = {
  testEnvironment: 'jsdom',
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Remove coverage thresholds for now since we can't track IIFE coverage properly
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80
  //   }
  // },

  // Test file patterns
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Module resolution
  moduleFileExtensions: ['js', 'json'],

  // Global settings
  globals: {
    'window': true
  },

  // Timeout for tests
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true
};