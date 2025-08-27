import React from 'react';
import { render } from '@testing-library/react';
import { MemoryScene } from '../MemoryVisualizer3D';
import { AppProvider } from '../../context/AppContext';
import { Canvas } from '@react-three/fiber';

// Mock drei components to avoid complex dependencies
jest.mock('@react-three/drei', () => ({
  Text: () => <group />,
  Html: () => <div />,
  OrbitControls: () => null,
}));

describe('MemoryVisualizer3D', () => {
  test('renderiza la escena 3D sin errores', () => {
    render(
      <AppProvider>
        <Canvas>
          <MemoryScene />
        </Canvas>
      </AppProvider>
    );

    // Test that component renders without crashing
    expect(true).toBe(true);
  });

  test('componente se monta sin errores', () => {
    const { container } = render(
      <AppProvider>
        <Canvas data-testid="3d-canvas">
          <MemoryScene />
        </Canvas>
      </AppProvider>
    );

    expect(container).toBeInTheDocument();
  });
});
