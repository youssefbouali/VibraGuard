import '@testing-library/jest-dom';

// Suppress React Router v6 → v7 deprecation warnings and React forwardRef warnings
// that clutter test output. These are harmless and already tracked upstream.
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('Function components cannot be given refs')) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
