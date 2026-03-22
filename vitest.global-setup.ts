import path from 'node:path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { StartedDockerComposeEnvironment } from 'testcontainers/build/docker-compose-environment/started-docker-compose-environment.js';

const infraPath: string = path.resolve(__dirname, 'infra');
const composeDatabasesFile: string = 'compose-databases.yaml';
let environment: StartedDockerComposeEnvironment | undefined;

export async function setup(): Promise<void> {
  environment = await new DockerComposeEnvironment(infraPath, [composeDatabasesFile])
    .withEnvironment({ POSTGRES_PORT: '5556' })
    .withWaitStrategy('postgres-1', Wait.forHealthCheck())
    .withWaitStrategy('postgres-migrations-1', Wait.forOneShotStartup().withStartupTimeout(60_000))
    .up();
}

export async function teardown(): Promise<void> {
  await environment?.down({ removeVolumes: true });
}
