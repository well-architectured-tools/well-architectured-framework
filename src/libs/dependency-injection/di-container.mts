import { Builder, Container } from '@novadi/core';
import { DotenvSafeEnvironmentService } from '../environment/index.mjs';
import { PinoLoggerService } from '../logger/index.mjs';
import { PgPostgresService } from '../postgres/index.mjs';

const container: Container = new Container();
const builder: Builder = container.builder();

builder.registerType(DotenvSafeEnvironmentService).as('EnvironmentService').singleInstance();
builder.registerType(PinoLoggerService).as('LoggerService').singleInstance().autoWire();
builder.registerType(PgPostgresService).as('PostgresService').singleInstance().autoWire();

export type DiContainer = Container;
export const diContainer: DiContainer = builder.build();
