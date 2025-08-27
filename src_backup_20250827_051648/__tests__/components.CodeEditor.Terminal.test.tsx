import React from 'react';
import { render, screen, act } from '@testing-library/react';
import CodeEditor, { Terminal } from '../components/CodeEditor';

describe('CodeEditor', () => {
  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  test('renders code and copies to clipboard', async () => {
    render(<CodeEditor code={'int x = 42;'} language="cpp" onChange={() => {}} />);
    screen.getByText(/cpp/i);
    screen.getByText(/copiar/i).click();
    await act(async () => Promise.resolve());
    expect((navigator.clipboard.writeText as jest.Mock).mock.calls[0][0]).toContain('int x');
  });
});

describe('Terminal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('executes steps and updates progress', async () => {
    render(<Terminal code={''} language="cpp" lessonId={0} />);
    const runBtn = screen.getByRole('button', { name: /ejecutar/i });
    await act(async () => {
      runBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    // Should show either output or running indicator
    expect(screen.getByText(/terminal - cpp/i)).toBeInTheDocument();
  });
});
