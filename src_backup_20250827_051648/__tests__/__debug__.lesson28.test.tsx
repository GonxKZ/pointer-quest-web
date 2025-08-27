export {};

test('DEBUG import Lesson28', async () => {
  try {
    await import('../lessons/Lesson28_CastLaboratory');
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('DEBUG ERROR L28:', e && (e.stack || e.message || e));
    throw e;
  }
});

