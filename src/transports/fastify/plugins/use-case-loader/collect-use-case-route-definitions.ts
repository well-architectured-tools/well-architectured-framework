import { findUseCaseHandlers } from './find-use-case-handlers.js';
import type { UseCaseHttpMethod, UseCaseKind, UseCaseRouteDefinition } from './use-case-loader-types.js';
import { detectUseCaseKind } from './detect-use-case-kind.js';
import { extractModuleName } from './extract-module-name.ts';
import path from 'node:path';

export async function collectUseCaseRouteDefinitions(
  modulesDirectoryPath: string,
  routePrefix: string,
): Promise<UseCaseRouteDefinition[]> {
  const handlerFilesPaths: string[] = await findUseCaseHandlers(modulesDirectoryPath);
  const routes: UseCaseRouteDefinition[] = [];

  for (const filePath of handlerFilesPaths) {
    const useCaseKind: UseCaseKind | null = detectUseCaseKind(filePath);
    if (useCaseKind === null) {
      continue;
    }

    const moduleName: string | null = extractModuleName(modulesDirectoryPath, filePath);
    if (moduleName === null) {
      continue;
    }

    routes.push({
      method: resolveUseCaseHttpMethod(useCaseKind),
      moduleName,
      routePath: buildRoutePath(routePrefix, moduleName, filePath),
      filePath,
    });
  }

  routes.sort((left: UseCaseRouteDefinition, right: UseCaseRouteDefinition): number => {
    return `${left.method}:${left.routePath}`.localeCompare(`${right.method}:${right.routePath}`);
  });

  assertRouteDefinitionsAreUnique(routes);

  return routes;
}

function resolveUseCaseHttpMethod(useCaseKind: UseCaseKind): UseCaseHttpMethod {
  if (useCaseKind === 'command') {
    return 'POST';
  }

  return 'GET';
}

function buildRoutePath(routePrefix: string, moduleName: string, filePath: string): string {
  const extension: string = path.extname(filePath);
  const fileNameWithHandlerSuffix: string = path.basename(filePath, extension);
  const useCaseName: string = fileNameWithHandlerSuffix.replace(/\.handler$/u, '');
  const normalizedRoutePrefix: string = normalizeRoutePrefix(routePrefix);

  return `${normalizedRoutePrefix}/${moduleName}/${useCaseName}`;
}

function normalizeRoutePrefix(routePrefix: string): string {
  if (routePrefix.length === 0 || routePrefix === '/') {
    return '';
  }

  const hasLeadingSlash: boolean = routePrefix.startsWith('/');
  const normalizedPrefixWithLeadingSlash: string = hasLeadingSlash ? routePrefix : `/${routePrefix}`;

  if (!normalizedPrefixWithLeadingSlash.endsWith('/')) {
    return normalizedPrefixWithLeadingSlash;
  }

  return normalizedPrefixWithLeadingSlash.slice(0, -1);
}

function assertRouteDefinitionsAreUnique(routeDefinitions: UseCaseRouteDefinition[]): void {
  const routeByMethodAndPath: Map<string, string> = new Map<string, string>();

  for (const routeDefinition of routeDefinitions) {
    const routeKey: string = `${routeDefinition.method}:${routeDefinition.routePath}`;
    const conflictingFilePath: string | undefined = routeByMethodAndPath.get(routeKey);
    if (conflictingFilePath !== undefined) {
      throw new Error(
        `Duplicate route "${routeKey}" for use-cases "${conflictingFilePath}" and "${routeDefinition.filePath}".`,
      );
    }

    routeByMethodAndPath.set(routeKey, routeDefinition.filePath);
  }
}
