// Polyfills y stubs para entorno de test (JSDOM)
// Canvas API básica para componentes que revisan su existencia
import 'jest-canvas-mock';

// Web Speech API stub (para VirtualNarrator)
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: () => {},
    cancel: () => {},
    getVoices: () => [],
  },
  writable: true,
});

