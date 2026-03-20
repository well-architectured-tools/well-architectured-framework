---
name: create-or-update-domain-aggregate
description: Create or update domain aggregate.
---

## When to use this skill
To create or update a domain aggregate in a particular module.

## How to use this skill
1. If the domain aggregate does not exist, create a new file in the `src/modules/<module-name>/domain/aggregates` directory with the name `<aggregate-name>.aggregate.ts`.
2. Update the file according to the data model from migrations.
3. Make sure you follow project standards for domain aggregates, to make it consistent with the rest of the project.
