import { Builder, Container } from '@novadi/core';
import { DotenvSafeEnvironmentService } from '../environment/index.js';
import { PinoLoggerService } from '../logger/index.js';
import { PgPostgresService, PostgresUnitOfWork } from '../postgres/index.js';
import { NodeSqliteService, SqliteUnitOfWork } from '../sqlite/index.js';
import { FastifyTransport } from '../../transports/fastify/index.js';
import {
  CreateTaxonomyHandler,
  PostgresTaxonomyRepository,
  SqliteTaxonomyRepository,
} from '../../modules/taxonomy/index.js';

// eslint-disable-next-line no-process-env
const testProject: string | undefined = process.env['TEST_PROJECT'];

const container: Container = new Container();
const builder: Builder = container.builder();

// LIBRARY SERVICES
builder.registerType(DotenvSafeEnvironmentService).as('EnvironmentService').singleInstance();
builder.registerType(PinoLoggerService).as('LoggerService').singleInstance();
if (!testProject) {
  builder.registerType(PgPostgresService).as('PostgresService').singleInstance();
  builder.registerType(PostgresUnitOfWork).as('UnitOfWork').singleInstance();
} else if (testProject === 'use-case-tests') {
  builder.registerType(NodeSqliteService).as('SqliteService').singleInstance();
  builder.registerType(SqliteUnitOfWork).as('UnitOfWork').singleInstance();
} else if (testProject === 'infra-tests') {
  builder.registerType(PgPostgresService).as('PostgresService').singleInstance();
  builder.registerType(NodeSqliteService).as('SqliteService').singleInstance();
}

// TRANSPORT
if (!testProject) {
  builder.registerType(FastifyTransport).as('Transport').singleInstance();
}

// TAXONOMY
builder.registerType(CreateTaxonomyHandler).as('CreateTaxonomyHandler').singleInstance();
if (!testProject) {
  builder.registerType(PostgresTaxonomyRepository).as('TaxonomyRepository').singleInstance();
} else if (testProject === 'use-case-tests') {
  builder.registerType(SqliteTaxonomyRepository).as('TaxonomyRepository').singleInstance();
}

export type DiContainer = Container;
export const diContainer: DiContainer = builder.build();
