const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/'],
  collectCoverageFrom: [
    // Only collect coverage from tested modules
    'lib/scoring/**/*.{js,ts}',
    'lib/encryption.ts',
    'lib/nlp-service.ts',
    'components/breath/**/*.{jsx,tsx}',
    'components/mood/**/*.{jsx,tsx}',
    'components/shared/sos-button.tsx',
    'components/shared/app-header.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    // Per-file thresholds for tested modules
    // Core scoring algorithms - high coverage required
    './lib/scoring/ace.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './lib/scoring/phq9.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './lib/scoring/gad7.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './lib/scoring/archetype.ts': {
      branches: 90,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    // Encryption - security critical
    './lib/encryption.ts': {
      branches: 45,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    // NLP Service client
    './lib/nlp-service.ts': {
      branches: 40,
      functions: 85,
      lines: 55,
      statements: 55,
    },
    // Components
    './components/mood/mood-chart.tsx': {
      branches: 55,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './components/shared/sos-button.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = createJestConfig(customJestConfig);
