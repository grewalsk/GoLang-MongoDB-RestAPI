// jest.setup.js
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// You can add other global setup here if needed

// Clean up after each test
afterEach(() => {
  // if you're using jest.fn for fetch, you might want to clear it
  global.fetch.mockClear();
});

// Or, if you want to reset to the original implementation (if any was mocked)
// afterEach(() => {
//   jest.restoreAllMocks();
// });
