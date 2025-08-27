import path from 'path';
import fs from 'fs';

jest.setTimeout(30000);

// Mock drei/fiber para evitar side-effects en importación
jest.mock('@react-three/drei', () => ({}));
jest.mock('@react-three/fiber', () => ({ Canvas: () => null }));

function getLessonFiles(): string[] {
  const dir = path.resolve(__dirname, '../lessons');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => path.join(dir, f).replace(/\\/g, '/'));
}

describe('Lessons import-only health check', () => {
  const files = getLessonFiles();

  test.each(files)('imports %s without throwing', async (file) => {
    try {
      const mod = await import(file);
      expect(mod).toBeTruthy();
    } catch (e) {
      // Log error to help pinpoint syntax issues in code blocks
      // eslint-disable-next-line no-console
      console.error('Import failed for', file, e);
      throw e;
    }
  });
});
