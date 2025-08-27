import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebAssembly, useAnimationLoop } from '../hooks/useWebAssembly';

describe('useWebAssembly hook', () => {
  test('initialize sets engine and exposes methods', async () => {
    const { result } = renderHook(() => useWebAssembly());

    // Wait for initialize effect to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.engine).not.toBeNull();

    act(() => {
      result.current.addPointer({
        id: 'p1', start_x: 0, start_y: 0, start_z: 0, end_x: 1, end_y: 1, end_z: 1,
        color: '#fff', thickness: 1, animated: true,
      });
      result.current.addMemoryBlock({
        id: 'm1', x: 0, y: 0, z: 0, width: 1, height: 1, depth: 1, color: '#f00', memory_type: 'stack',
      });
      result.current.animate(0.016);
      // render is async
    });

    await result.current.render('canvas-id');

    act(() => {
      result.current.setAnimationSpeed(2);
      result.current.reset();
    });

    expect(result.current.getPointerCount()).toBe(0);
    expect(result.current.getMemoryBlockCount()).toBe(0);
  });
});

describe('useAnimationLoop hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('calls onAnimate repeatedly when active and stops on cleanup', () => {
    const onAnimate = jest.fn();
    const { result, unmount } = renderHook(() => useAnimationLoop(onAnimate, true));

    act(() => {
      // advance ~48ms -> about 3 frames at 16ms
      jest.advanceTimersByTime(48);
    });

    expect(onAnimate).toHaveBeenCalled();

    act(() => {
      result.current.stop();
    });

    const callCount = onAnimate.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onAnimate.mock.calls.length).toBe(callCount);

    unmount();
  });
});
