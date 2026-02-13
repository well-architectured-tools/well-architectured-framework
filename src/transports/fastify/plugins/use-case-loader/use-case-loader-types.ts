export type UseCaseKind = 'command' | 'query';

export type UseCaseHttpMethod = 'POST' | 'GET';

export interface UseCaseRouteDefinition {
  method: UseCaseHttpMethod;
  moduleName: string;
  routePath: string;
  filePath: string;
}
