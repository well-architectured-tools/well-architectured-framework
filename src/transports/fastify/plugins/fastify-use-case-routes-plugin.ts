import path from 'node:path';
import { readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { diContainer } from '../../../libs/dependency-injection/index.js';
import type { LoggerService } from '../../../libs/logger/index.js';
import type { CommandHandler, QueryHandler } from '../../../libs/kernel/index.js';
import type { FastifySuccessResponse } from '../responses/fastify-success-response.js';

type UseCaseKind = 'command' | 'query';
type FastifyUseCaseRouteMethod = 'POST' | 'GET';
type UseCaseHandler = CommandHandler<unknown> | QueryHandler<unknown, unknown>;
type UseCaseHandlerConstructor = new () => UseCaseHandler;
export type FastifyRoutePrefix = '' | `/${string}`;

interface UseCaseHandlerFileMetadata {
  readonly filePath: string;
  readonly useCaseKind: UseCaseKind;
}

interface FastifyUseCaseRouteSpec {
  readonly method: FastifyUseCaseRouteMethod;
  readonly routePath: string;
  readonly filePath: string;
}

interface NormalizedFastifyUseCaseRoutesPluginOptions {
  readonly modulesDirectoryPath: string;
  readonly routePrefix: FastifyRoutePrefix;
}

class FastifyUseCaseRoutesAutoRegistrar {
  private static readonly useCaseHandlerFilePattern: RegExp = /\.handler\.(?:ts|js)$/u;
  private readonly fastify: FastifyInstance;
  private readonly options: NormalizedFastifyUseCaseRoutesPluginOptions;
  private readonly loggerService: LoggerService;

  constructor(fastify: FastifyInstance, options: FastifyUseCaseRoutesPluginOptions, loggerService: LoggerService) {
    this.fastify = fastify;
    this.options = this.normalizeOptions(options);
    this.loggerService = loggerService;
  }

  async registerRoutes(): Promise<void> {
    const routeSpecs: FastifyUseCaseRouteSpec[] = await this.collectRouteSpecs();

    for (const routeSpec of routeSpecs) {
      const handler: UseCaseHandler = await this.resolveHandlerFromContainer(routeSpec.filePath);
      this.registerRoute(routeSpec, handler);
    }

    this.logRegisteredRoutes(routeSpecs);
  }

  private normalizeOptions(options: FastifyUseCaseRoutesPluginOptions): NormalizedFastifyUseCaseRoutesPluginOptions {
    this.assertNonEmptyString(options.modulesDirectoryPath, 'modulesDirectoryPath');
    const routePrefix: FastifyRoutePrefix = options.routePrefix ?? '';
    this.assertValidRoutePrefix(routePrefix);

    return {
      modulesDirectoryPath: path.resolve(options.modulesDirectoryPath),
      routePrefix: this.normalizeRoutePrefix(routePrefix),
    };
  }

  private assertNonEmptyString(value: string, optionName: string): void {
    if (value.trim().length === 0) {
      throw new Error(`Fastify use-case routes plugin option "${optionName}" must be a non-empty string.`);
    }
  }

  private assertValidRoutePrefix(routePrefix: string): asserts routePrefix is FastifyRoutePrefix {
    if (routePrefix !== '' && !routePrefix.startsWith('/')) {
      throw new Error('Fastify use-case routes plugin option "routePrefix" must start with "/".');
    }
  }

  private async collectRouteSpecs(): Promise<FastifyUseCaseRouteSpec[]> {
    const handlerFiles: UseCaseHandlerFileMetadata[] = await this.discoverUseCaseHandlerFiles(
      this.options.modulesDirectoryPath,
    );
    const routeSpecs: FastifyUseCaseRouteSpec[] = [];

    for (const handlerFile of handlerFiles) {
      const moduleName: string | null = this.resolveModuleName(handlerFile.filePath);
      if (moduleName === null) {
        continue;
      }

      routeSpecs.push({
        method: handlerFile.useCaseKind === 'command' ? 'POST' : 'GET',
        routePath: this.buildRoutePath(moduleName, handlerFile.filePath),
        filePath: handlerFile.filePath,
      });
    }

    routeSpecs.sort((left: FastifyUseCaseRouteSpec, right: FastifyUseCaseRouteSpec): number => {
      return `${left.method}:${left.routePath}`.localeCompare(`${right.method}:${right.routePath}`);
    });

    this.assertUniqueRouteSpecs(routeSpecs);

    return routeSpecs;
  }

  private async discoverUseCaseHandlerFiles(directoryPath: string): Promise<UseCaseHandlerFileMetadata[]> {
    let entries: Dirent[];
    try {
      entries = await readdir(directoryPath, { withFileTypes: true, encoding: 'utf8' });
    } catch (error: unknown) {
      throw new Error(`Fastify use-case routes plugin failed to read directory "${directoryPath}".`, { cause: error });
    }

    const handlerFiles: UseCaseHandlerFileMetadata[] = [];

    for (const entry of entries) {
      const fullPath: string = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        const nestedHandlerFiles: UseCaseHandlerFileMetadata[] = await this.discoverUseCaseHandlerFiles(fullPath);
        handlerFiles.push(...nestedHandlerFiles);
        continue;
      }

      if (!entry.isFile() || !FastifyUseCaseRoutesAutoRegistrar.useCaseHandlerFilePattern.test(entry.name)) {
        continue;
      }

      const useCaseKind: UseCaseKind | null = this.resolveUseCaseKind(fullPath);
      if (useCaseKind === null) {
        continue;
      }

      this.assertHandlerFileMatchesDirectoryName(fullPath);
      handlerFiles.push({
        filePath: fullPath,
        useCaseKind,
      });
    }

    return handlerFiles;
  }

  private resolveUseCaseKind(filePath: string): UseCaseKind | null {
    const normalizedFilePath: string = this.toPosixPath(filePath).toLowerCase();
    if (normalizedFilePath.includes('/interactors/commands/')) {
      return 'command';
    }

    if (normalizedFilePath.includes('/interactors/queries/')) {
      return 'query';
    }

    return null;
  }

  private resolveModuleName(filePath: string): string | null {
    const relativePath: string = path.relative(this.options.modulesDirectoryPath, filePath);
    const normalizedRelativePath: string = this.toPosixPath(relativePath);
    const [moduleName]: string[] = normalizedRelativePath.split('/');

    if (moduleName === undefined || moduleName.length === 0 || moduleName === '.' || moduleName === '..') {
      return null;
    }

    return moduleName;
  }

  private buildRoutePath(moduleName: string, filePath: string): string {
    const extension: string = path.extname(filePath);
    const fileNameWithHandlerSuffix: string = path.basename(filePath, extension);
    const useCaseName: string = fileNameWithHandlerSuffix.replace(/\.handler$/u, '');

    return `${this.options.routePrefix}/${moduleName}/${useCaseName}`;
  }

  private normalizeRoutePrefix(routePrefix: FastifyRoutePrefix): FastifyRoutePrefix {
    if (routePrefix.length === 0 || routePrefix === '/') {
      return '';
    }

    if (!routePrefix.endsWith('/')) {
      return routePrefix;
    }

    const routePrefixWithoutTrailingSlash: string = routePrefix.slice(0, -1);
    if (routePrefixWithoutTrailingSlash.length === 0 || routePrefixWithoutTrailingSlash === '/') {
      return '';
    }

    return routePrefixWithoutTrailingSlash as FastifyRoutePrefix;
  }

  private toPosixPath(filePath: string): string {
    return filePath.split(path.sep).join('/');
  }

  private assertHandlerFileMatchesDirectoryName(handlerFilePath: string): void {
    const parentDirectoryName: string = path.basename(path.dirname(handlerFilePath));
    const handlerBaseName: string = path
      .basename(handlerFilePath)
      .replace(FastifyUseCaseRoutesAutoRegistrar.useCaseHandlerFilePattern, '');
    if (handlerBaseName !== parentDirectoryName) {
      throw new Error(
        `Handler file name "${handlerBaseName}" does not match its parent directory name "${parentDirectoryName}".`,
      );
    }
  }

  private assertUniqueRouteSpecs(routeSpecs: FastifyUseCaseRouteSpec[]): void {
    const routeByMethodAndPath: Map<string, string> = new Map<string, string>();

    for (const routeSpec of routeSpecs) {
      const routeKey: string = `${routeSpec.method}:${routeSpec.routePath}`;
      const conflictingFilePath: string | undefined = routeByMethodAndPath.get(routeKey);
      if (conflictingFilePath !== undefined) {
        throw new Error(`Duplicate route "${routeKey}" for use-cases "${conflictingFilePath}" and "${routeSpec.filePath}".`);
      }

      routeByMethodAndPath.set(routeKey, routeSpec.filePath);
    }
  }

  private async resolveHandlerFromContainer(filePath: string): Promise<UseCaseHandler> {
    const handlerTokenName: string = await this.resolveHandlerTokenName(filePath);

    let resolvedHandler: unknown;
    try {
      resolvedHandler = diContainer.resolveType(handlerTokenName);
    } catch (error: unknown) {
      throw new Error(
        `Use case handler "${handlerTokenName}" from module "${filePath}" is not registered in diContainer.`,
        { cause: error },
      );
    }

    if (!this.isExecutableUseCaseHandler(resolvedHandler)) {
      throw new Error(`Resolved dependency "${handlerTokenName}" from module "${filePath}" is not a valid use case handler.`);
    }

    return resolvedHandler;
  }

  private async resolveHandlerTokenName(filePath: string): Promise<string> {
    const fileUrl: string = pathToFileURL(filePath).href;
    let importedModule: Record<string, unknown>;
    try {
      importedModule = (await import(fileUrl)) as Record<string, unknown>;
    } catch (error: unknown) {
      throw new Error(`Failed to import use case handler module "${filePath}".`, { cause: error });
    }

    const handlerConstructors: UseCaseHandlerConstructor[] = Object.values(importedModule).filter(
      (value: unknown): value is UseCaseHandlerConstructor => {
        return this.isUseCaseHandlerConstructor(value);
      },
    );

    if (handlerConstructors.length !== 1) {
      throw new Error(`Use case handler module "${filePath}" must export exactly one handler class.`);
    }

    const handlerConstructor: UseCaseHandlerConstructor | undefined = handlerConstructors[0];
    if (handlerConstructor === undefined) {
      throw new Error(`Use case handler module "${filePath}" could not be resolved.`);
    }

    const handlerTokenName: string = handlerConstructor.name;
    if (handlerTokenName.length === 0) {
      throw new Error(`Use case handler module "${filePath}" exports an anonymous handler class.`);
    }

    return handlerTokenName;
  }

  private isUseCaseHandlerConstructor(value: unknown): value is UseCaseHandlerConstructor {
    if (typeof value !== 'function') {
      return false;
    }

    if (!('prototype' in value)) {
      return false;
    }

    const executableCandidate: unknown = (value as { prototype: { execute?: unknown } }).prototype.execute;
    return typeof executableCandidate === 'function';
  }

  private isExecutableUseCaseHandler(value: unknown): value is UseCaseHandler {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const executableCandidate: unknown = (value as { execute?: unknown }).execute;
    return typeof executableCandidate === 'function';
  }

  private registerRoute(routeSpec: FastifyUseCaseRouteSpec, handler: UseCaseHandler): void {
    if (routeSpec.method === 'POST') {
      this.registerCommandRoute(routeSpec.routePath, handler);
      return;
    }

    this.registerQueryRoute(routeSpec.routePath, handler);
  }

  private registerCommandRoute(routePath: string, handler: UseCaseHandler): void {
    this.fastify.post(
      routePath,
      async (request: FastifyRequest<{ Body: unknown }>, _reply: FastifyReply): Promise<FastifySuccessResponse<true>> => {
        await handler.execute(request.body);

        return { data: true };
      },
    );
  }

  private registerQueryRoute(routePath: string, handler: UseCaseHandler): void {
    this.fastify.get(
      routePath,
      async (
        request: FastifyRequest<{ Querystring: unknown }>,
        _reply: FastifyReply,
      ): Promise<FastifySuccessResponse<unknown>> => {
        const result: unknown = await handler.execute(request.query);

        return { data: result };
      },
    );
  }

  private logRegisteredRoutes(routeSpecs: readonly FastifyUseCaseRouteSpec[]): void {
    this.loggerService.info('Fastify use-case routes registered', {
      routes: routeSpecs.map((routeSpec: FastifyUseCaseRouteSpec): string => {
        return `${routeSpec.method} ${routeSpec.routePath}`;
      }),
    });
  }
}

export interface FastifyUseCaseRoutesPluginOptions {
  readonly modulesDirectoryPath: string;
  readonly routePrefix?: FastifyRoutePrefix;
}

export const fastifyUseCaseRoutesPlugin: FastifyPluginAsync<FastifyUseCaseRoutesPluginOptions> = async (
  fastify: FastifyInstance,
  options: FastifyUseCaseRoutesPluginOptions,
): Promise<void> => {
  const loggerService: LoggerService = diContainer.resolveType('LoggerService');
  const routesAutoRegistrar: FastifyUseCaseRoutesAutoRegistrar = new FastifyUseCaseRoutesAutoRegistrar(
    fastify,
    options,
    loggerService,
  );

  await routesAutoRegistrar.registerRoutes();
};
