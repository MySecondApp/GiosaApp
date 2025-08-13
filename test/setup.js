import '@testing-library/jest-dom';

// Mock Stimulus
global.Turbo = {
  StreamActions: {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

// Mock window methods
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});

// Setup DOM
document.body.innerHTML = `
  <div id="test-container"></div>
  <body data-controller="flash-notifications"></body>
`;

// Console override for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: process.env.VERBOSE_TESTS ? originalConsole.log : () => {},
  warn: originalConsole.warn,
  error: originalConsole.error
};
