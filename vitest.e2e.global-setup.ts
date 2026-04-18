import path from 'node:path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { StartedDockerComposeEnvironment } from 'testcontainers/build/docker-compose-environment/started-docker-compose-environment.js';
import { e2eComposeEnvironment } from './vitest.e2e.environment.js';

const infraPath: string = path.resolve(__dirname, 'infra');
const composeDatabasesFile: string = 'compose-databases.yaml';
const composeE2EFile: string = 'compose-e2e.yaml';
let environment: StartedDockerComposeEnvironment | undefined;

export async function setup(): Promise<void> {
  if (process.env['E2E_BASE_URL']) {
    return;
  }

  environment = await new DockerComposeEnvironment(infraPath, [composeDatabasesFile, composeE2EFile])
    .withBuild()
    .withEnvironment(e2eComposeEnvironment)
    .withWaitStrategy('postgres-1', Wait.forHealthCheck())
    .withWaitStrategy('postgres-migrations-1', Wait.forOneShotStartup().withStartupTimeout(60_000))
    .withWaitStrategy('app-1', Wait.forHealthCheck())
    .withStartupTimeout(120_000)
    .up();
}

export async function teardown(): Promise<void> {
  await environment?.down({ removeVolumes: true });
}
