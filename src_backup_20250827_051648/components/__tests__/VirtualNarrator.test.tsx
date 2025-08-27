import React from 'react';
import { render, screen, act } from '@testing-library/react';
import VirtualNarrator from '../../components/VirtualNarrator';

jest.useFakeTimers();

describe('VirtualNarrator', () => {
  test('reproduce mensajes automáticamente y llama onMessageComplete', () => {
    const onComplete = jest.fn();

    const messages = [
      { id: 'm1', text: 'Hola', type: 'info' as const, duration: 1 },
      { id: 'm2', text: 'Adiós', type: 'success' as const, duration: 1 },
    ];

    render(
      <VirtualNarrator
        messages={messages}
        autoPlay={true}
        voiceEnabled={false}
        onMessageComplete={onComplete}
      />
    );

    // El componente está montado (botón de saltar visible)
    expect(screen.getByText('×')).toBeInTheDocument();

    // Avanza el tiempo para completar el primer mensaje
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    // Asegura que m1 se haya completado al menos una vez
    const calls1 = onComplete.mock.calls.map((c) => c[0]);
    expect(calls1.includes('m1')).toBe(true);

    // Avanza otro poco y debería completar el segundo
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    const calls2 = onComplete.mock.calls.map((c) => c[0]);
    expect(calls2.includes('m2')).toBe(true);
  });
});
