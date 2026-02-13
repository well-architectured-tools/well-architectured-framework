import path from 'node:path';

export function normalizeFilePath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}
