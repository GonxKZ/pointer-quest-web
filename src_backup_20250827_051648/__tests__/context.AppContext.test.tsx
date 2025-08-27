import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '../context/AppContext';

function TestComponent() {
  const { state, dispatch } = useApp();
  return (
    <div>
      <div data-testid="is3d">{String(state.is3DMode)}</div>
      <button onClick={() => dispatch({ type: 'TOGGLE_3D_MODE' })}>toggle</button>
    </div>
  );
}


test('AppContext reducer toggles 3D mode', () => {
  render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );

  expect(screen.getByTestId('is3d').textContent).toBe('false');
  act(() => {
    screen.getByText('toggle').click();
  });
  expect(screen.getByTestId('is3d').textContent).toBe('true');
});
