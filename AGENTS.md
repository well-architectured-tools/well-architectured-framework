# AGENTS.md - AI Coding Agent Guide

## Scope

This file is the working guide for coding agents in this repository. Keep changes aligned with the existing DDD + Clean Architecture shape, verify facts against the code before editing, and prefer small, focused patches.

## Project Shape

This is a Node.js 24 backend written in TypeScript with ESM (`"type": "module"`). Runtime code lives under `src/`; compiled output goes to `dist/` and should not be edited by hand.

```
src/
  libs/          # Shared DDD primitives, kernel contracts, env, logger, postgres, DI, helpers
  modules/       # Feature modules; currently enrich/ has domain, infrastructure, interactors
  transports/    # Transport adapters; currently fastify/
```

Main flow:

```
Transport -> Controller -> OperationHandler -> UnitOfWork -> Repository -> Aggregate -> DB
```

The application entry point is `src/index.ts`. It resolves all DI registrations under the `Transport` token and starts them.

## Architecture Rules

- `libs` are shared building blocks. They must not depend on modules or transports, except `src/libs/dependency-injection/di-container.ts`, which is the composition root.
- Module `domain/` contains aggregates, entities, value objects, and domain events. It may depend on `libs`, not on infrastructure or transports.
- Module `interactors/` contains use-case handlers, DTOs, repository interfaces, and mappers used by application logic.
- Module `infrastructure/` implements persistence and external adapters for that module. It may depend on the module domain/interactors and `libs`.
- `transports/` adapt HTTP or other protocols to use cases. They should import module public APIs from module `index.ts`, not deep private implementation paths when avoidable.
- Re-export module-facing types and handlers from `src/modules/<module>/index.ts` when DI or transports need them.
- Keep generated/build artifacts out of source changes. Do not patch `dist/` to fix behavior.

## TypeScript And Imports

- All relative source imports use `.js` extensions even when importing `.ts` files. This is required for Node ESM.
- Prefer `import type` for type-only imports.
- The repo uses strict TypeScript and strict ESLint rules. Add explicit return types and parameter/property types.
- Avoid `any`. If a framework boundary truly needs it, keep the `eslint-disable` narrow and justified.
- `typia` and `@novadi/core` rely on TypeScript transformer plugins from `tsconfig.json`. Do not call `typia.*` from uncompiled ad hoc JavaScript.

## Dependency Injection

DI uses `@novadi/core` (`Container` / `Builder`). The composition root is:

```
src/libs/dependency-injection/di-container.ts
```

Rules:

- Register services by string token, for example `.as('CreateProjectHandler').singleInstance()`.
- Constructor dependencies are resolved by type via the `@novadi/core/transformer` plugin.
- Keep token names stable and exact; controllers and health checks resolve by these strings.
- Add new handlers/repositories/services to `di-container.ts` and export public module symbols from the module `index.ts`.
- `process.env.TEST_PROJECT` changes registrations for test projects. Current recognized values are `infra-tests` and `use-case-tests`; e2e tests normally hit a running/containerized app instead of resolving app DI in-process.

## Domain Layer

Shared DDD primitives live in `src/libs/ddd/`.

- `ValueObject<TProps>` freezes props with `Object.freeze` and compares by deep equality.
- `Entity<TProps>` uses `UuidV7` identity.
- `AggregateRoot<TProps>` stores domain events; call `addDomainEvent()` inside aggregate behavior and `pullDomainEvents()` when dispatching.
- Use `UuidV7` for entity IDs. Use `UuidV4` only for correlation, idempotency, or external request identifiers.
- Put invariants and creation rules inside aggregates/value objects, not controllers.
- Use `create(...)` for new aggregates and `rehydrate(...)` for persistence reconstruction.

## Use-Case Handlers

Handlers implement `OperationHandler<TParams, TResult>` from `src/libs/kernel/handlers/operation-handler.ts`.

Pattern:

```ts
export class CreateProjectHandler implements OperationHandler<CreateProjectParams, CreateProjectDto> {
  private readonly unitOfWork: UnitOfWork;

  constructor(unitOfWork: UnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  async execute(params: CreateProjectParams): Promise<CreateProjectDto> {
    try {
      return await this.unitOfWork.run(async (transactionalContext: TransactionalContext): Promise<CreateProjectDto> => {
        // use repositories with transactionalContext
      });
    } catch (error) {
      wrapErrorToApplicationErrorAndThrow(error);
    }
  }
}
```

Rules:

- Wrap handler bodies in `unitOfWork.run(...)`.
- Pass `TransactionalContext` to repositories for DB work inside the transaction.
- Convert aggregates to DTOs through mapper objects; do not return domain objects from handlers.
- Catch `unknown` errors and call `wrapErrorToApplicationErrorAndThrow(error)`.
- Keep params and DTO types close to the handler under `interactors/commands`, `queries`, or `reactions`.

## Error Handling

- `ApplicationError` is in `src/libs/kernel/errors/application-error.ts`.
- Current application error types are `NOT_FOUND`, `VALIDATION`, and `UNEXPECTED`.
- Use stable machine-readable codes such as `PROJECT_NOT_FOUND`.
- Use `wrapErrorToApplicationErrorAndThrow(error)` in use-case handlers.
- Use `handleDataError(error)` where typia validation or persistence mapping can fail.
- Fastify error handling maps `ApplicationError.type` to HTTP status codes in `src/transports/fastify/error-handlers/`.

## Persistence And Migrations

Postgres infrastructure lives in `src/libs/postgres/` and module-specific repository implementations live under module `infrastructure/`.

Rules:

- Repository interfaces belong in `interactors/shared/...`; implementations belong in `infrastructure/...`.
- Use persistence mappers for domain/persistence conversion.
- Validate DB rows with `typia.assert<...>(data)` before mapping to domain.
- Catch persistence validation/mapping failures with `handleDataError(error)`.
- Keep SQL parameterized; do not interpolate user data into SQL strings.
- Migrations live in `migrations/postgres/` and run through `node-pg-migrate`.

Commands:

```sh
npm run pg-migrations:create
npm run pg-migrations:up
```

When adding required schema, create a migration and update infrastructure tests.

## Fastify Transport

Fastify code lives in `src/transports/fastify/`.

- Controllers are autoloaded from `controllers/`.
- Controller files must match `*.controller.ts` / `*.controller.js` with lowercase path segments accepted by the autoload `matchFilter`.
- `dirNameRoutePrefix: false`; each controller defines its full route path.
- Health endpoints are `/livez` and `/readyz`.
- Static assets are copied from `assets/` to `dist/server/` by `npm run assets` and served from `public/`.
- AJV is strict: no type coercion, no defaults, no union types, remove additional properties.
- Use `addTypiaAsJsonSchema(...)` for request/response schemas.
- Validate outgoing success responses with `typia.assert<FastifySuccessResponse<...>>(response)` before sending.

Controller shape:

- Resolve the handler from DI by token.
- Cast `request.body` only after Fastify schema validation.
- Return `{ data: result }` for success responses.
- Let thrown `ApplicationError`s reach the shared Fastify error handler.

## Environment

Environment contracts live in:

```
src/libs/environment/environment-service.ts
src/libs/environment/dotenv-safe-environment-service.ts
src/libs/environment/simple-environment-service.ts
```

Required variables currently include:

- `LOAD_DOTENV` (`true` or `false`, defaults to `true` in `DotenvSafeEnvironmentService`)
- `NODE_ENV` (`production`, `development`, `test`)
- `LOG_LEVEL` (`info`, `warn`, `error`, `silent`)
- `PORT`
- `POSTGRES_URL`
- `VALKEY_HOST`
- `VALKEY_PORT`
- `VALKEY_USER`
- `VALKEY_PASSWORD`

When adding or changing env vars, update:

- `EnvironmentVariables`
- `DotenvSafeEnvironmentService`
- `.env.example`
- Vitest env blocks/global setup if tests need the value
- Docker/compose env passing if the app needs the value in containers

## Testing

Vitest projects are configured in `vitest.config.ts`.

| Script                   | Type           | Test files                                                                    |
| ------------------------ | -------------- | ----------------------------------------------------------------------------- |
| `npm run unit-tests`     | Unit           | `src/**/*.test.ts`                                                            |
| `npm run infra-tests`    | Infrastructure | `dist/test/modules/*/infrastructure/**/*.infra-test.js`                       |
| `npm run use-case-tests` | Use case       | `dist/test/modules/*/interactors/{commands,queries,reactions}/*/*.uc-test.js` |
| `npm run e2e-tests`      | E2E            | `dist/test/transports/*/e2e/**/*.e2e-test.js`                                 |

Important details:

- `infra-tests`, `use-case-tests`, and `e2e-tests` compile test code first via `npm run build:test`.
- Infrastructure and use-case tests use Testcontainers with `infra/compose-databases.yaml`.
- Test DB URL for infra/use-case tests is `postgres://postgres:postgres@localhost:5556/postgres`.
- Test Valkey port for infra/use-case tests is `6667`.
- E2E global setup starts `infra/compose-databases.yaml` plus `infra/compose-app.yaml` unless `E2E_BASE_URL` is already set.
- E2E default base URL is `http://localhost:4001`.
- `npm run e2e-tests:dev` uses `E2E_BASE_URL=http://127.0.0.1:3000` for testing an already running local server.

Useful commands:

```sh
npm run unit-tests
npm run infra-tests
npm run use-case-tests
npm run e2e-tests
```

Run the narrowest relevant test first, then broaden when touching shared behavior, DI, transport, migrations, or env.

## Local Development Commands

```sh
npm run develop        # starts infra, builds assets, watches TS, restarts server
npm run build:server   # compiles src to dist/server
npm run build:test     # compiles src/tests to dist/test
npm run assets         # copies assets/ into dist/server/
npm run lint:check
npm run lint:write
npm run format:check
npm run format:write
npm run infra:up       # docker compose databases + keycloak
npm run infra:down     # stops compose stack and removes volumes
```

`infra:up` uses:

- `infra/compose-databases.yaml` for Postgres, migrations, and Valkey
- `infra/compose-keycloak.yaml` for Keycloak

## Adding A New Use Case

Checklist:

1. Add or update domain objects under `src/modules/<module>/domain/`.
2. Add params/DTOs/handler under `interactors/commands`, `queries`, or `reactions`.
3. Add repository interfaces and DTO mappers under `interactors/shared` when needed.
4. Add infrastructure repository/persistence mapper under `infrastructure/`.
5. Add or update Postgres migrations for schema changes.
6. Export public symbols from `src/modules/<module>/index.ts`.
7. Register handler/repository tokens in `di-container.ts`.
8. Add or update controller under `src/transports/fastify/controllers/`.
9. Add focused tests at the correct level: unit, use-case, infra, and/or e2e.
10. Run lint and the relevant test script(s).

## Code Style Priorities

- Follow existing local patterns before introducing new abstractions.
- Keep controllers thin; business decisions belong in handlers/domain objects.
- Keep repositories focused on persistence and mapping.
- Keep DTOs serializable and explicit.
- Prefer structured parsers, type guards, and mappers over ad hoc string manipulation.
- Do not hide failures with broad fallbacks; convert them into typed application errors at the appropriate boundary.
- Preserve user changes in the working tree. Do not revert unrelated edits.
