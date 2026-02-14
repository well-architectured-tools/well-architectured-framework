import { pathToFileURL } from 'node:url';
import type { CommandHandler, QueryHandler } from '../../../../libs/kernel/index.js';
import { diContainer } from '../../../../libs/dependency-injection/index.js';

type UseCaseHandlerConstructor = new () => CommandHandler<unknown> | QueryHandler<unknown, unknown>;

export async function loadUseCaseHandler(
  filePath: string,
): Promise<CommandHandler<unknown> | QueryHandler<unknown, unknown>> {
  const fileUrl: string = pathToFileURL(filePath).href;
  const importedModule: Record<string, unknown> = (await import(fileUrl)) as Record<string, unknown>;
  const handlerConstructors: UseCaseHandlerConstructor[] = Object.values(importedModule).filter(
    (value: unknown): value is UseCaseHandlerConstructor => {
      return isUseCaseHandlerConstructor(value);
    },
  );

  if (handlerConstructors.length !== 1) {
    throw new Error(`Use case handler module "${filePath}" must export exactly one handler class.`);
  }

  const handlerConstructor: UseCaseHandlerConstructor | undefined = handlerConstructors[0];
  if (handlerConstructor === undefined) {
    throw new Error(`Use case handler module "${filePath}" could not be resolved.`);
  }

  const handlerTypeName: string = handlerConstructor.name;
  if (handlerTypeName.length === 0) {
    throw new Error(`Use case handler module "${filePath}" exports an anonymous handler class.`);
  }

  try {
    return diContainer.resolveType<CommandHandler<unknown> | QueryHandler<unknown, unknown>>(handlerTypeName);
  } catch (error: unknown) {
    throw new Error(
      `Use case handler "${handlerTypeName}" from module "${filePath}" is not registered in diContainer.`,
      { cause: error },
    );
  }
}

function isUseCaseHandlerConstructor(value: unknown): value is UseCaseHandlerConstructor {
  if (typeof value !== 'function') {
    return false;
  }

  if (!('prototype' in value)) {
    return false;
  }

  const executableCandidate: unknown = (value as { prototype: { execute?: unknown } }).prototype.execute;
  return typeof executableCandidate === 'function';
}
