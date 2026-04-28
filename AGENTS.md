# AGENTS.md - Repository Guide for Coding Agents

## Purpose

This file is the operating guide for agents working in this repository. Treat it as a contract with the current codebase: verify facts before editing, keep patches focused, preserve existing user work, and keep changes aligned with the DDD + Clean Architecture boundaries enforced by ESLint.

When instructions here conflict with the code, the code and checked-in configuration win. Update this guide when you intentionally change architecture, scripts, environment variables, or testing workflows.

## Repository Snapshot

This is a private Node.js 24 backend written in strict TypeScript and native ESM (`"type": "module"`). Source code lives under `src/`; compiled output goes to `dist/` and must not be edited by hand.

```
src/
  libs/          # Shared DDD primitives, kernel contracts, environment, logging, Postgres, DI, helpers
  modules/       # Business modules; enrich/ currently contains real source
  transports/    # Delivery adapters; fastify/ is the current HTTP transport

assets/          # Static assets copied into dist/server by npm run assets
infra/           # Docker Compose files for Postgres, Valkey, Keycloak, app
migrations/      # node-pg-migrate SQL migrations
dist/            # Build output, generated locally
```

Current runtime flow:

```
src/index.ts
  -> diContainer.resolveTypeAll('Transport')
  -> FastifyTransport
  -> controller
  -> OperationHandler
  -> UnitOfWork
  -> Repository
  -> Aggregate / Value Objects
  -> Postgres
```

The only implemented use case today is `CreateProjectHandler` in the `enrich` module. `src/modules/account` exists as a directory, but currently has no source files; do not infer implemented account behavior from it.

## Agent Workflow

- Start by reading the relevant code and configs. Prefer `rg` / `rg --files` for discovery.
- Keep edits small and local to the behavior requested.
- Do not patch `dist/`, `node_modules/`, generated build info, or release artifacts unless the user explicitly asks for release work.
- Preserve unrelated working-tree changes. If a file is already modified, read it before editing and work with the existing changes.
- Run the narrowest useful verification first, then broaden when touching shared architecture, DI, migrations, transport, or environment behavior.
- If you add or change a durable convention, update this file in the same change.

## Architecture Boundaries

The dependency rules are enforced by `eslint-plugin-boundaries` in `eslint.config.js`. Keep imports consistent with those rules.

### `libs/`

`src/libs` contains shared building blocks. A normal lib may depend only on itself and lib public indexes. The exception is `src/libs/dependency-injection/di-container.ts`, which is the composition root and may import module and transport public indexes.

Use existing lib indexes for cross-boundary imports:

- `src/libs/kernel/index.ts`
- `src/libs/ddd/index.ts`
- `src/libs/environment/index.ts`
- `src/libs/logger/index.ts`
- `src/libs/postgres/index.ts`
- `src/libs/http-client/index.ts`
- `src/libs/dependency-injection/index.ts`

### `modules/`

Modules follow DDD + Clean Architecture layering:

```
domain/          # Aggregates, entities, value objects, domain events
interactors/     # Use cases, DTOs, repository interfaces, application mappers
infrastructure/  # Persistence and external adapters for the module
index.ts         # Public module API for DI/transports
```

Rules:

- `domain/` may depend on same-module domain code and `libs` indexes only.
- `interactors/` may depend on same-module interactors, same-module domain, and `libs` indexes.
- `infrastructure/` may depend on same-module infrastructure, interactors, domain, and `libs` indexes.
- `module/index.ts` may re-export same-module domain, interactors, and infrastructure that are needed outside the module.
- Re-export only symbols intended for DI, transports, tests, or another module-facing contract. Keep private implementation files private when possible.

### `transports/`

Transports adapt protocols to use cases. Fastify controllers should import module-facing symbols from `src/modules/<module>/index.ts` instead of deep module paths when practical. Transport code may depend on same-transport files, `libs` indexes, and module indexes.

## TypeScript, ESM, and Style

- All relative source imports must include `.js` extensions, even when importing `.ts` files.
- Prefer `import type` for type-only imports.
- Keep explicit return types and explicit parameter/property/variable types where ESLint requires them.
- Avoid `any`. If a framework boundary forces it, keep the `eslint-disable` narrow and explain why.
- Do not use `console` in `src/`; use `LoggerService`.
- Do not read `process.env` directly in ordinary source. Environment access belongs in the environment services or carefully scoped setup/composition code.
- Do not reassign parameters.
- Use strict equality and braces for control flow.
- Respect `@typescript-eslint/member-ordering`.
- This repo uses `typia` and `@novadi/core` TypeScript transformer plugins from `tsconfig.json`; do not call `typia.*` from uncompiled ad hoc JavaScript.
- Keep files ASCII unless there is a specific reason and nearby source already uses non-ASCII.

Important configs:

- `tsconfig.json` extends Node 24, Node TS, and strictest presets.
- `tsconfig.build.json` compiles runtime `src/**/*.ts` to `dist/server`.
- `tsconfig.test.json` compiles source and tests to `dist/test`.
- `eslint.config.js` ignores `dist` and lints `src/**/*.ts`.
- Prettier is configured through `@well-architectured-tools/prettier-config`.

## Dependency Injection

DI uses `@novadi/core` (`Container` / `Builder`). The composition root is:

```
src/libs/dependency-injection/di-container.ts
```

Registrations use stable string tokens:

- `EnvironmentService`
- `LoggerService`
- `PostgresService`
- `UnitOfWork`
- `Transport`
- `ProjectRepository`
- `PostgresProjectRepository`
- `CreateProjectHandler`

Rules:

- Add new services, repositories, handlers, and transports to `di-container.ts`.
- Keep token names exact; controllers, tests, health checks, and entrypoint code resolve by string token.
- Constructor dependencies are resolved by type through the `@novadi/core/transformer` plugin.
- Export any DI-visible module symbols from `src/modules/<module>/index.ts`.
- Runtime (`TEST_PROJECT` unset) registers env, logger, Postgres, unit of work, Fastify transport, project repository, and create-project handler.
- `TEST_PROJECT=use-case-tests` registers shared services plus `ProjectRepository` and use-case handlers, but no transport.
- `TEST_PROJECT=infra-tests` registers shared services plus concrete infrastructure repositories, but not application handlers.
- E2E tests normally hit an external/containerized app over HTTP; do not rely on resolving app DI inside e2e tests.

## Domain Layer

Shared DDD primitives live in `src/libs/ddd/`.

- `ValueObject<TProps>` freezes props with `Object.freeze` and compares by deep equality.
- `Entity<TProps>` owns a `UuidV7` identity and compares by identity.
- `AggregateRoot<TProps>` stores uncommitted domain events with `addDomainEvent()` and clears them with `pullDomainEvents()`.
- `DateTime`, `UuidV4`, `UuidV7`, and `JsonString` validate through `ApplicationError` when invalid.
- Use `UuidV7` for entity and aggregate IDs.
- Use `UuidV4` for correlation, idempotency, external request identifiers, or non-entity request IDs.
- Put invariants and creation rules in aggregates/value objects, not controllers or repositories.
- Use `create(...)` for new domain objects and `rehydrate(...)` for persistence reconstruction.
- Keep domain objects free of infrastructure and transport imports.

## Use-Case Handlers

Handlers implement:

```
OperationHandler<TParams, TResult>
```

from `src/libs/kernel/handlers/operation-handler.ts`.

Expected handler shape:

```ts
export class CreateProjectHandler implements OperationHandler<CreateProjectParams, CreateProjectDto> {
  private readonly unitOfWork: UnitOfWork;
  private readonly projectRepository: ProjectRepository;

  constructor(unitOfWork: UnitOfWork, projectRepository: ProjectRepository) {
    this.unitOfWork = unitOfWork;
    this.projectRepository = projectRepository;
  }

  async execute(params: CreateProjectParams): Promise<CreateProjectDto> {
    try {
      return await this.unitOfWork.run(
        async (transactionalContext: TransactionalContext): Promise<CreateProjectDto> => {
          // Create/modify aggregates and call repositories with transactionalContext.
        },
      );
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
```

Rules:

- Wrap DB-changing handler work in `unitOfWork.run(...)`.
- Pass `TransactionalContext` to repositories for DB work inside a transaction.
- Convert aggregates to DTOs through mapper objects; do not return domain objects from handlers.
- Catch `unknown` errors at the handler boundary and call `wrapErrorToApplicationErrorAndThrow(error)`.
- Keep params and result DTOs close to the handler under `interactors/commands`, `queries`, or `reactions`.
- Put reusable DTOs, repository interfaces, and DTO mappers under `interactors/shared/...`.
- Name files consistently with the current pattern: `<use-case>.params.ts`, `<use-case>.dto.ts`, `<use-case>.handler.ts`, `<use-case>.handler.uc-test.ts`.

## Errors

Application errors live in `src/libs/kernel/errors/`.

Current `ApplicationErrorType` values:

- `NOT_FOUND` -> HTTP 404
- `VALIDATION` -> HTTP 400
- `UNEXPECTED` -> HTTP 500

Rules:

- Use stable machine-readable error codes, for example `PROJECT_NOT_FOUND`.
- Preserve causal errors with `ApplicationErrorOptions.cause` when wrapping.
- Use `wrapErrorToApplicationErrorAndThrow(error)` at use-case boundaries.
- Use `handleDataError(error)` where database row validation or persistence mapping can fail.
- `handleDataError` converts `typia.TypeGuardError` to `DATA_VALIDATION_ERROR`.
- Fastify error handlers are responsible for HTTP status mapping and development-only stack/detail exposure.

## Persistence and Migrations

Postgres infrastructure lives in `src/libs/postgres/` and module-specific implementations live under `src/modules/<module>/infrastructure/`.

Current schema is in `migrations/postgres/`:

- `1774029018084_enrich.sql` creates `enrich.project` and `enrich.catalog`.
- `1772292404267_account.sql` currently exists but is empty.
- `migrations/postgres/config.json` configures `node-pg-migrate`.

Rules:

- Repository interfaces belong in `interactors/shared/...`.
- Concrete repositories belong in `infrastructure/...`.
- Persistence shapes should be explicit interfaces next to the repository implementation.
- Use persistence mappers for domain <-> persistence conversion.
- Validate DB rows with `typia.assert<...>(data)` before mapping to domain.
- Catch repository and mapper failures with `handleDataError(error)`.
- Keep SQL parameterized for user data. Do not interpolate request or domain values into SQL strings.
- Pass `transactionalContext` through repository methods when called inside a `UnitOfWork`.
- If a schema change is required, create a migration and update infrastructure tests.
- `PgPostgresService.withTransaction(...)` reuses an existing transaction when one is provided; nested handlers should pass the context onward instead of starting independent transactions.

Migration commands:

```sh
npm run pg-migrations:create
npm run pg-migrations:up
```

## Fastify Transport

Fastify code lives in `src/transports/fastify/`.

Key facts:

- `FastifyTransport` creates the server, registers plugins, static assets, health endpoints, error handlers, and autoloaded controllers.
- Controllers are autoloaded from `src/transports/fastify/controllers/`.
- Controller filenames must match lowercase path segments ending in `.controller.ts` or `.controller.js`.
- `dirNameRoutePrefix: false`; each controller defines its full route path.
- Static files are copied from `assets/` to `dist/server/` by `npm run assets` and served from `dist/server/public`.
- Health endpoints are `/livez` and `/readyz`.
- `/readyz` currently checks Postgres readiness.
- AJV is strict: no coercion, no defaults, no union types, schema validation on, additional properties removed.

Controller rules:

- Resolve handlers from DI by token.
- Use `addTypiaAsJsonSchema(...)` for request and response schemas.
- Cast `request.body` only after Fastify schema validation.
- Return successful responses in the shape `{ data: result }`.
- Validate the full outgoing success response with `typia.assert<FastifySuccessResponse<T>>(successResult)` before sending.
- Route validation, application errors, and serialization errors should flow to the shared Fastify error handler.
- Use `FastifyErrorResponse` for documented `4xx` and `5xx` responses.

## Environment

Environment contracts live in:

```
src/libs/environment/environment-service.ts
src/libs/environment/dotenv-safe-environment-service.ts
src/libs/environment/simple-environment-service.ts
```

Current required variables:

- `LOAD_DOTENV` - `true` or `false`, defaults to `true` in `DotenvSafeEnvironmentService`
- `NODE_ENV` - `production`, `development`, or `test`
- `LOG_LEVEL` - `info`, `warn`, `error`, or `silent`
- `PORT` - integer from 1 to 65535
- `POSTGRES_URL`
- `VALKEY_HOST`
- `VALKEY_PORT` - integer from 1 to 65535
- `VALKEY_USER`
- `VALKEY_PASSWORD`

Update all relevant places when adding, removing, or changing environment variables:

- `EnvironmentVariables`
- `DotenvSafeEnvironmentService`
- `.env.example`
- `vitest.config.ts` env blocks or e2e environment files
- Docker Compose environment passing in `infra/`
- Dockerfile defaults if runtime behavior depends on them
- Health/readiness checks if the variable introduces a required dependency

Valkey variables are currently part of the environment contract, but no Valkey client service is implemented yet. Do not add readiness expectations for Valkey without adding the service and tests.

## Testing

Vitest projects are configured in `vitest.config.ts`.

| Script                   | Purpose                                            | Test files                                                                    |
| ------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run unit-tests`     | Unit tests run from TypeScript source              | `src/**/*.test.ts`                                                            |
| `npm run infra-tests`    | Repository/infrastructure tests after `build:test` | `dist/test/modules/*/infrastructure/**/*.infra-test.js`                       |
| `npm run use-case-tests` | Use-case tests after `build:test`                  | `dist/test/modules/*/interactors/{commands,queries,reactions}/*/*.uc-test.js` |
| `npm run e2e-tests`      | HTTP e2e tests after `build:test`                  | `dist/test/transports/*/e2e/**/*.e2e-test.js`                                 |
| `npm run e2e-tests:dev`  | E2E against an already running local app           | `E2E_BASE_URL=http://127.0.0.1:3000`                                          |

Important details:

- `infra-tests`, `use-case-tests`, and `e2e-tests` run `npm run clear:test` and `npm run build:test` first.
- Infra and use-case tests use Testcontainers with `infra/compose-databases.yaml`.
- Infra/use-case test Postgres URL is `postgres://postgres:postgres@localhost:5556/postgres`.
- Infra/use-case test Valkey port is `6667`.
- E2E global setup starts `infra/compose-databases.yaml` plus `infra/compose-app.yaml` unless `E2E_BASE_URL` is set.
- E2E default app URL is `http://localhost:4001`.
- `vitest.setup.ts` adds custom matchers: `toBeUuidV4String`, `toBeUuidV7String`, and `toBeISODateTimeString`.
- Close Postgres connections in tests that resolve `PostgresService`.
- Use `vi.setSystemTime(...)` for deterministic timestamps when aggregates call `DateTime.createNow()`.

Verification guidance:

- Domain/helper change: start with `npm run unit-tests`.
- Repository or migration change: run `npm run infra-tests`.
- Handler/use-case change: run `npm run use-case-tests`.
- Controller/Fastify/error/env/DI change: run the relevant use-case tests plus `npm run e2e-tests` when feasible.
- Shared architecture/import/type changes: run `npm run lint:check` and the impacted tests.

## Local Commands

```sh
npm run develop        # infra up, clear server build, copy assets, watch TS, restart server
npm run build:server   # compile runtime src to dist/server
npm run build:test     # compile source/tests to dist/test
npm run assets         # copy assets/. into dist/server/
npm run start          # run dist/server/index.js with source maps and inspector
npm run lint:check     # eslint ./src
npm run lint:write     # eslint ./src --fix
npm run format:check   # prettier ./src --check
npm run format:write   # prettier ./src --write
npm run infra:up       # Postgres, migrations, Valkey, Keycloak
npm run infra:down     # stop compose stack and remove volumes
```

Docker/infra facts:

- `infra:up` uses `infra/compose-databases.yaml` and `infra/compose-keycloak.yaml`.
- Local default Postgres port is `5555`; local default Valkey port is `6666`.
- Keycloak runs on host port `8888`.
- The app container is defined in `infra/compose-app.yaml`.
- The Dockerfile builds on `node:24.14-bookworm-slim`, runs `build:server`, copies assets, prunes dev dependencies, and starts `dist/server/index.js`.

## Adding a New Use Case

Use this checklist for a normal write-side use case:

1. Add or update domain aggregate/entity/value-object behavior under `src/modules/<module>/domain/`.
2. Add params, DTO, and handler under `interactors/commands/<use-case>/`.
3. Add shared DTO mappers or repository interfaces under `interactors/shared/...` when needed.
4. Add or update infrastructure repository, persistence interface, and persistence mapper under `infrastructure/...`.
5. Add a Postgres migration when persistence schema changes.
6. Export public symbols from `src/modules/<module>/index.ts`.
7. Register new handlers/repositories/services in `src/libs/dependency-injection/di-container.ts` for the correct runtime and test project branches.
8. Add or update Fastify controller under `src/transports/fastify/controllers/...` if the use case is HTTP-facing.
9. Add focused tests at the right level: unit, infra, use-case, and/or e2e.
10. Run lint and the narrowest relevant tests, then broaden if the change touched shared behavior.

For read-side use cases, prefer `interactors/queries/<query>/` and keep query DTOs serializable and explicit.

For async reactions, prefer `interactors/reactions/<reaction>/`; keep event handling idempotent when external delivery semantics require it.

## Changing Fastify Controllers

Controller files should follow the existing explicit pattern:

- Define `method`, `path`, and `successResponseCode`.
- Define handler token/name constants next to local handler types.
- Generate typia schemas for params, success response, and `FastifyErrorResponse`.
- Register schemas through `addTypiaAsJsonSchema(...)`.
- Resolve the handler once from `diContainer`.
- In the route callback, cast already-validated request data, call the handler, wrap response as `{ data }`, validate the response object, and send it.

Keep controllers thin. Authorization, business decisions, persistence, and domain rules belong below the transport boundary.

## Release and Package Notes

- `semantic-release` is configured for `main` in `release.config.mjs`.
- Release assets are `CHANGELOG.md`, `package.json`, and `package-lock.json`.
- `@semantic-release/npm` is configured with `npmPublish: false`.
- `prepare` runs `ts-patch install`; do not remove it unless replacing the transformer setup for both typia and Novadi.

## Known Guardrails

- Do not fix behavior by editing compiled files in `dist/`.
- Do not bypass architecture boundaries with deep imports just to satisfy a quick change.
- Do not add broad fallbacks that hide data, validation, or infrastructure failures.
- Do not add runtime dependencies without checking whether the repo already has a local abstraction.
- Do not make repository SQL by interpolating untrusted data.
- Do not introduce environment variables without updating config, Docker, tests, and examples.
- Do not add a handler or repository without registering it in DI and exporting it when needed.
- Do not add an HTTP endpoint without request/response schemas and response validation.
- Do not assume TODO items are implemented; verify current code first.
