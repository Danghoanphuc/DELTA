module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // ✅ SỬA LỖI 1: Thay thế "next/babel" bằng các trình dịch chuẩn
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          "@babel/preset-env",
          // Thêm 'runtime: "automatic"' để Babel hiểu React 17+
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
      },
    ],
  },

  moduleNameMapper: {
    // Giữ nguyên các quy tắc cũ
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",

    // ✅ SỬA LỖI 3: Dạy Jest hiểu "Đường tắt" @/*
    // Nó phải khớp 100% với "paths" trong tsconfig.json
    "^@/(.*)$": "<rootDir>/src/$1",

    // Mock axios module to avoid import.meta issues
    "^@/shared/lib/axios$": "<rootDir>/__mocks__/axios.js",
  },

  // ✅ CHỈNH CHU: Thay thế thư mục .next (Next.js) bằng dist (Vite)
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],

  // Ignore empty test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};
