module.exports = {
  testEnvironment: 'node',
  rootDir: './src',
  testTimeout: 30000,
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testTimeout: 30000,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};