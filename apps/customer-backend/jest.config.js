// apps/customer-backend/jest.config.js

export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { configFile: "./babel.config.cjs" }],
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/__tests__/**/*.test.ts",
    "**/tests/**/*.test.js",
    "**/tests/**/*.test.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/tests/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  testTimeout: 30000,
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
