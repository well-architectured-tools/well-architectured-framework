import path from 'node:path';
import { normalizeFilePath } from './normalize-file-path.js';

export function extractModuleName(modulesDirectoryPath: string, filePath: string): string | null {
  const relativePath: string = path.relative(modulesDirectoryPath, filePath);
  const normalizedRelativePath: string = normalizeFilePath(relativePath);
  const [moduleName]: string[] = normalizedRelativePath.split('/');

  if (moduleName === undefined || moduleName.length === 0) {
    return null;
  }

  return moduleName;
}
