import React from 'react';
import { render, screen } from '@testing-library/react';
import MemoryVisualizer from '../../components/MemoryVisualizer';
import { AppProvider } from '../../context/AppContext';

describe('MemoryVisualizer (2D)', () => {
  test('muestra secciones Stack, Heap y Global con datos iniciales', () => {
    render(
      <AppProvider>
        <MemoryVisualizer />
      </AppProvider>
    );

    // Secciones visibles
    expect(screen.getByText('📚 Stack')).toBeInTheDocument();
    expect(screen.getByText('🏗️ Heap')).toBeInTheDocument();
    expect(screen.getByText('🌍 Global')).toBeInTheDocument();

    // Bloques iniciales (definidos en AppContext initialState)
    expect(screen.getByText(/int x = 42/i)).toBeInTheDocument();
    expect(screen.getByText(/char\* ptr/i)).toBeInTheDocument();
    expect(screen.getByText(/new int\[5\]/i)).toBeInTheDocument();
    expect(screen.getByText(/string data/i)).toBeInTheDocument();
    expect(screen.getByText(/static var/i)).toBeInTheDocument();

    // Leyenda básica
    expect(screen.getByText(/stack variables/i)).toBeInTheDocument();
    expect(screen.getByText(/heap objects/i)).toBeInTheDocument();
    expect(screen.getByText(/global variables/i)).toBeInTheDocument();
  });
});

