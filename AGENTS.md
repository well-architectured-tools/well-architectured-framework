# AGENTS.md — AI Coding Agent Guide

## Architecture Overview

This project is a **DDD + Clean Architecture** Node.js backend using TypeScript (ESM, `"type": "module"`).

```
src/
  libs/          # Reusable library code (DDD primitives, kernel interfaces/helpers/errors, postgres, logger, DI, env)
  modules/       # Feature modules (e.g. main) — each has domain/, infrastructure/, interactors/
  transports/    # Transport adapters (e.g. fastify) — controllers, e2e tests, error handlers
```

**Data flow:** Transport → Controller → `OperationHandler` (use case) → `UnitOfWork` → Repository → Domain Aggregate → DB.

**Entry point:** `src/index.ts` resolves all `Transport` registrations from DI and starts them.

## Dependency Injection

Uses `@novadi/core` (`Container` / `Builder`). **All wiring is in `src/libs/dependency-injection/di-container.ts`.**
- Services are registered by string token: `.as('ServiceName').singleInstance()`
- Constructor parameters are resolved by type via the `@novadi/core/transformer` TypeScript plugin
- DI configuration changes based on `process.env.TEST_PROJECT` to swap real/test implementations

## Domain Layer (`src/libs/ddd/`)

- `ValueObject<TProps>` — immutable (`Object.freeze`), equality via `isDeepStrictEqual`
- `Entity<TProps>` — identity by **UUIDv7** (`_id: UuidV7`)
- `AggregateRoot<TProps>` — extends Entity; use `addDomainEvent()` / `pullDomainEvents()` for domain events
- IDs are always `UuidV7` (time-sortable); use `UuidV4` only for correlation/idempotency keys

## Use-Case Handlers

Implement `OperationHandler<TParams, TResult>` from `src/libs/kernel/handlers/operation-handler.ts`:
```ts
export class CreateProjectHandler implements OperationHandler<CreateProjectParams, CreateProjectDto> {
  async execute(params: CreateProjectParams): Promise<CreateProjectDto> {
    return this.unitOfWork.run(async (tx) => { /* ... */ });
  }
}
```
Always wrap the body in `unitOfWork.run()` and catch with `wrapErrorToApplicationErrorAndThrow(error)`.

## Error Handling

- **`ApplicationError`** (`src/libs/kernel/errors/application-error.ts`) — typed errors with `type: 'NOT_FOUND' | 'VALIDATION' | 'UNEXPECTED'` and a `code` string (e.g. `'PROJECT_NOT_FOUND'`)
- Use `wrapErrorToApplicationErrorAndThrow(error)` in handler catch blocks
- Use `handleDataError(error)` when catching `typia` type-guard failures
- Fastify error handler maps `ApplicationError.type` to HTTP status codes automatically

## Transport Layer (`src/transports/fastify/`)

- Controllers are **autoloaded** from `controllers/` — file must match `*.controller.ts`
- Use `@fastify/autoload` with `dirNameRoutePrefix: false`; define routes inside the controller file
- AJV is strict: `coerceTypes: false`, `removeAdditional: 'all'`, no union types, no defaults

## Environment Variables

Required: `NODE_ENV`, `LOG_LEVEL` (`info|warn|error`), `PORT`, `POSTGRES_URL`, `LOAD_DOTENV`.  
Defined in `src/libs/environment/environment-service.ts`; add new vars there and in `DotenvSafeEnvironmentService`.

## Testing

Four test projects (configured in `vitest.config.ts`):

| Script | Type | Source |
|--------|------|--------|
| `npm run unit-tests` | Unit | `src/**/*.test.ts` (runs in-process, no build) |
| `npm run infra-tests` | Infrastructure | `dist/test/modules/*/infrastructure/**/*.infra-test.js` (**requires build first**) |
| `npm run use-case-tests` | Use-case | `dist/test/modules/*/interactors/**/*.uc-test.js` (**requires build first**) |
| `npm run e2e-tests` | E2E | `src/transports/*/e2e/**/*.e2e-test.ts` (requires `infra:up`) |

- `infra-tests` and `use-case-tests` must be compiled first: `npm run build:test`
- Infrastructure uses **testcontainers** (`src/libs/...`) but DB URL is fixed to `localhost:5556` in vitest env
- `npm run infra:up` starts Postgres via Docker Compose (`infra/compose-databases.yaml`)

## Key Conventions

- All imports use `.js` extension even for `.ts` source files (Node ESM requirement)
- No `any` except where explicitly suppressed with `eslint-disable`
- `typia` is used for runtime type validation; it requires the TypeScript transformer plugin — do **not** call `typia.*` functions outside of compiled TypeScript
- Migrations use `node-pg-migrate` in `migrations/postgres/`; create with `npm run pg-migrations:create`, apply with `npm run pg-migrations:up`
- `eslint-plugin-boundaries` enforces layer boundaries — `libs` cannot import from `modules` or `transports`
