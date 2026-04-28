import path from 'node:path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { StartedDockerComposeEnvironment } from 'testcontainers/build/docker-compose-environment/started-docker-compose-environment.js';
import { e2eEnvironment } from './vitest.e2e.environment.js';

const infraPath: string = path.resolve(__dirname, 'infra');
const composeDatabasesFile: string = 'compose-databases.yaml';
const composeAppFile: string = 'compose-app.yaml';
let environment: StartedDockerComposeEnvironment | undefined;

export async function setup(): Promise<void> {
  if (process.env['E2E_BASE_URL']) {
    return;
  }

  environment = await new DockerComposeEnvironment(infraPath, [composeDatabasesFile, composeAppFile])
    .withBuild()
    .withEnvironment(e2eEnvironment)
    .withWaitStrategy('postgres-1', Wait.forHealthCheck())
    .withWaitStrategy('postgres-migrations-1', Wait.forOneShotStartup().withStartupTimeout(60_000))
    .withWaitStrategy('valkey-1', Wait.forHealthCheck())
    .withWaitStrategy('app-1', Wait.forHealthCheck())
    .withStartupTimeout(120_000)
    .up();
}

export async function teardown(): Promise<void> {
  await environment?.down({ removeVolumes: true });
}
