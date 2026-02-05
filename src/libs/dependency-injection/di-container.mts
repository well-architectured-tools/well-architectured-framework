import { Builder, Container } from '@novadi/core';
import { DotenvSafeEnvironmentService } from '../environment/index.mjs';

const container: Container = new Container();
const builder: Builder = container.builder();

builder.registerType(DotenvSafeEnvironmentService).as('EnvironmentService').singleInstance();

export type DiContainer = Container;
export const diContainer: DiContainer = builder.build();
