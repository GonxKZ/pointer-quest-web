import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza el botón de Vista 3D', () => {
  render(<App />);
  const toggle3D = screen.getByText(/vista 3d/i);
  expect(toggle3D).toBeInTheDocument();
});
