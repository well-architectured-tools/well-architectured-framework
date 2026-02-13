import { normalizeFilePath } from './normalize-file-path.js';
import type { UseCaseKind } from './use-case-loader-types.js';

export function detectUseCaseKind(filePath: string): UseCaseKind | null {
  const normalizedFilePath: string = normalizeFilePath(filePath);

  if (normalizedFilePath.includes('/interactors/commands/')) {
    return 'command';
  }

  if (normalizedFilePath.includes('/interactors/queries/')) {
    return 'query';
  }

  return null;
}
