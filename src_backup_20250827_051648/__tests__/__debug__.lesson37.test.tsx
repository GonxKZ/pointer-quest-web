export {};

test('DEBUG import Lesson37', async () => {
  try {
    await import('../lessons/Lesson37_CyclicSharedPtr');
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('DEBUG ERROR L37:', e && (e.stack || e.message || e));
    throw e;
  }
});

