# @well-architectured-tools/well-architectured-framework

## TODO

- health check endpoint valkey + disconnect and service https://glide.valkey.io/getting-started/quickstart/?lang=node
- загрузка файлов S3
- transaction outbox
- idempotency
- Optimistic Concurrency Control - version колонка, updated_at/etag-based conditional update, compare-and-swap. Чтобы не ловить lost update. Для HTTP это красиво ложится на: ETag, If-Match
- openapi and schema dont repeat ErrorResponse
- trace id and correlation id and observability and logger
- versioned api
- changelog and release docker container
- Kafka and event bus
- ClickHouse
- RBAC
- mcp transport
- helm and deploy to k8s
- feature flags
- фоновые джобы / delayed jobs / temporal?
- distributed locks / leader election
- circuit breaker / timeout policy - retry, backoff, “для вызовов сервиса X timeout 800ms, 2 retries, circuit breaker на 30 секунд”
