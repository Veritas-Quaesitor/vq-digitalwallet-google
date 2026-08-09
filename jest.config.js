module.exports = {
  testEnvironment: 'jsdom',

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/browser-global.ts',
    '!src/index.ts',
    '!src/core/contracts.ts',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Set from the actually-measured baseline after the module split and
  // focused per-module tests landed (79.84/73.25/91.52/80.81 measured on
  // 2026-08-09). A small margin below the measured numbers, not the
  // measured numbers themselves, so incidental drift fails CI before it
  // compounds — ratchet upward as real coverage improves, never downward
  // without a recorded reason.
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 70,
      functions: 88,
      lines: 78
    }
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript'
        ]
      }
    ]
  },

  // Global settings
  globals: {
    window: true
  },

  // Timeout for tests
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true
};
