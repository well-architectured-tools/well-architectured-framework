import { Builder, Container } from '@novadi/core';
import { DotenvSafeEnvironmentService } from '../environment/index.js';
import { PinoLoggerService } from '../logger/index.js';
import { PgPostgresService } from '../postgres/index.js';
import { FastifyTransport } from '../../transports/fastify/index.js';

const container: Container = new Container();
const builder: Builder = container.builder();

builder.registerType(DotenvSafeEnvironmentService).as('EnvironmentService').singleInstance();
builder.registerType(PinoLoggerService).as('LoggerService').singleInstance();
builder.registerType(PgPostgresService).as('PostgresService').singleInstance();

// TRANSPORT PLUGINS
builder.registerType(FastifyTransport).as('Transport').singleInstance();

export type DiContainer = Container;
export const diContainer: DiContainer = builder.build();
