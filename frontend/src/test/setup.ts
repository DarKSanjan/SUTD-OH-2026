import '@testing-library/jest-dom';

// Extend global type to include fetch mock
declare global {
  var fetch: typeof globalThis.fetch;
}
