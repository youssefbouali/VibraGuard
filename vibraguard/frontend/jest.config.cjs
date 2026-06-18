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
    '<rootDir>/client/components/**/*.{ts,tsx}',
    '!<rootDir>/client/pages/**/*.{ts,tsx}',
    '!<rootDir>/client/components/ui/**/*.{ts,tsx}',
    '!<rootDir>/client/lib/blockchain.ts',
    '!<rootDir>/client/hooks/use-moteurs.ts',
    '!<rootDir>/**/*.d.ts',
    '!<rootDir>/**/*.{test,spec}.*',
  ],
  coverageThreshold: {
    global: {
      statements: 48,
      branches: 38,
      functions: 49,
      lines: 48,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
