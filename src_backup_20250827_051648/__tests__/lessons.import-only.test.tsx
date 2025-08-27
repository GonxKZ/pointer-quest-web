import path from 'path';

// Mock drei/fiber para evitar side-effects en importación
jest.mock('@react-three/drei', () => ({}));
jest.mock('@react-three/fiber', () => ({ Canvas: () => null }));

const lessons = [
  '../lessons/Lesson01_RawPtr',
  '../lessons/Lesson13_CustomDeleter',
];

test.each(lessons)('imports %s module successfully', async (rel) => {
  const file = path.resolve(__dirname, rel + '.tsx').replace(/\\/g, '/');
  const mod = await import(file);
  expect(mod).toBeTruthy();
});
