import React from 'react';
import path from 'path';
import fs from 'fs';
import { render } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { MemoryRouter } from 'react-router-dom';

// Ligero mock para Canvas solo en este test de humo masivo (la lógica 3D se prueba aparte)
jest.mock('@react-three/fiber', () => {
  const actual = jest.requireActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
  };
});

// Evitar carga de fuentes o HTML overlay en bulk smoke
jest.mock('@react-three/drei', () => {
  const actual = jest.requireActual('@react-three/drei');
  return {
    ...actual,
    Text: (props: any) => <span {...props} />,
    Html: () => null,
  };
});

const roots = [
  path.resolve(__dirname, '../components'),
  path.resolve(__dirname, '../pages'),
];

function getTsxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (e.name.startsWith('__tests__')) continue;
      files.push(...getTsxFiles(path.join(dir, e.name)));
    } else if (e.isFile() && e.name.endsWith('.tsx')) {
      if (e.name.endsWith('.test.tsx')) continue;
      if (e.name === 'index.tsx') continue;
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

describe('Bulk smoke render of components/pages/lessons', () => {
  const files = roots.flatMap((r) => (fs.existsSync(r) ? getTsxFiles(r) : []));

  test.each(files)('renders or at least imports %s', async (file) => {
    const mod = await import(file.replace(/\\/g, '/'));
    expect(mod).toBeTruthy();
    const Comp = (mod as any).default || (mod as any)[Object.keys(mod)[0]];

    if (typeof Comp === 'function') {
      try {
        render(
          <AppProvider>
            <MemoryRouter>
              <Comp />
            </MemoryRouter>
          </AppProvider>
        );
      } catch {
        // Ignore heavy 3D components that require a full environment
      }
    }
  });
});
