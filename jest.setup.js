import "@testing-library/jest-dom";

// 1. Polyfill TextEncoder (Fixes the "ReferenceError: TextEncoder is not defined")
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Mock specific Next.js features that might cause issues
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
}));
