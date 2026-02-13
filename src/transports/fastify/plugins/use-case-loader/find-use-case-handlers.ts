import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { UseCaseKind } from './use-case-loader-types.js';
import { detectUseCaseKind } from './detect-use-case-kind.js';

const HANDLER_FILE_SUFFIX_REGEXP: RegExp = /\.handler\.(?:ts|js)$/u;

export async function findUseCaseHandlers(directoryPath: string): Promise<string[]> {
  const entries: Dirent[] = await readdir(directoryPath, { withFileTypes: true, encoding: 'utf8', recursive: false });
  const result: string[] = [];

  for (const entry of entries) {
    const fullPath: string = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles: string[] = await findUseCaseHandlers(fullPath);
      result.push(...nestedFiles);
      continue;
    }

    if (!entry.isFile() || !HANDLER_FILE_SUFFIX_REGEXP.test(entry.name)) {
      continue;
    }

    const useCaseKind: UseCaseKind | null = detectUseCaseKind(fullPath);
    if (useCaseKind === null) {
      continue;
    }

    assertHandlerNameMatch(fullPath);

    result.push(fullPath);
  }

  return result;
}

function assertHandlerNameMatch(handlerFilePath: string): void {
  const parentDirName: string = path.basename(path.dirname(handlerFilePath));
  const handlerBaseName: string = path.basename(handlerFilePath).replace(HANDLER_FILE_SUFFIX_REGEXP, '');
  if (handlerBaseName !== parentDirName) {
    throw new Error(
      `Handler file name "${handlerBaseName}" does not match its parent directory name "${parentDirName}".`,
    );
  }
}
