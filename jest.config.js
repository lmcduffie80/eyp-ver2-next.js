const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Stub out CSS/image imports to avoid transform overhead
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  // Restrict file discovery to source/test dirs so jest doesn't walk
  // the workspace's large media folders (Wedding/Prom/Photography/public, etc.)
  roots: [
    '<rootDir>/__tests__',
    '<rootDir>/app',
    '<rootDir>/components',
    '<rootDir>/lib',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    // macOS Finder / iCloud duplicates ("foo 2.tsx", "foo 3.ts", etc.)
    ' [0-9]\\.[jt]sx?$',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  // Limit workers to avoid memory exhaustion
  maxWorkers: 1,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
