module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/$1'
  },
  testMatch: [
    '<rootDir>/client/**/*.test.[jt]s?(x)',
    '<rootDir>/client/**/*.spec.[jt]s?(x)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false
    }]
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/client/hooks/**/*.{ts,tsx}',
    '<rootDir>/client/lib/**/*.{ts,tsx}',
    '!<rootDir>/client/lib/blockchain.ts',
    '!<rootDir>/client/hooks/use-moteurs.ts',
    '!<rootDir>/**/*.d.ts',
    '!<rootDir>/**/*.{test,spec}.*',
  ],
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 50,
      functions: 60,
      lines: 78,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
