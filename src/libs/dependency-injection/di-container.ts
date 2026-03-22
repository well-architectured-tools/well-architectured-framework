import { Builder, Container } from '@novadi/core';
import { DotenvSafeEnvironmentService, SimpleEnvironmentService } from '../environment/index.js';
import { PinoLoggerService } from '../logger/index.js';
import { PgPostgresService, PostgresUnitOfWork } from '../postgres/index.js';
import { FastifyTransport } from '../../transports/fastify/index.js';
import { CreateProjectHandler, PostgresProjectRepository } from '../../modules/main/index.js';

// eslint-disable-next-line no-process-env
const testProject: string | undefined = process.env['TEST_PROJECT'];

const container: Container = new Container();
const builder: Builder = container.builder();

// LIBRARY SERVICES
if (!testProject) {
  builder.registerType(DotenvSafeEnvironmentService).as('EnvironmentService').singleInstance();
  builder.registerType(PinoLoggerService).as('LoggerService').singleInstance();
  builder.registerType(PostgresUnitOfWork).as('UnitOfWork').singleInstance();
  builder.registerType(PgPostgresService).as('PostgresService').singleInstance();
} else if (testProject === 'infra-tests') {
  builder.registerType(SimpleEnvironmentService).as('EnvironmentService').singleInstance();
  builder.registerType(PinoLoggerService).as('LoggerService').singleInstance();
  builder.registerType(PgPostgresService).as('PostgresService').singleInstance();
}

// TRANSPORT
if (!testProject) {
  builder.registerType(FastifyTransport).as('Transport').singleInstance();
}

// PROJECT
if (!testProject) {
  builder.registerType(PostgresProjectRepository).as('ProjectRepository').singleInstance();
  builder.registerType(CreateProjectHandler).as('CreateProjectHandler').singleInstance();
} else if (testProject === 'infra-tests') {
  builder.registerType(PostgresProjectRepository).as('PostgresProjectRepository').singleInstance();
} else if (testProject === 'use-case-tests') {
  builder.registerType(PostgresProjectRepository).as('ProjectRepository').singleInstance();
  builder.registerType(CreateProjectHandler).as('CreateProjectHandler').singleInstance();
}

export type DiContainer = Container;
export const diContainer: DiContainer = builder.build();
