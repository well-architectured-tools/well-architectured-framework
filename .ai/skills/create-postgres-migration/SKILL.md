---
name: create-postgres-migration
description: Generate migration file and write Postgres 18 SQL.
---

## When to use this skill
To create a migration file for Postgres.

## How to use this skill
1. Run the migration creation command, replacing <migration-name> with a short, descriptive kebab-case name that matches the requested change:
```bash
npm run pg-migrations:base -- create <migration-name>
```
2. Remove all the content in the generated migration file, leaving it empty and ready for new SQL commands.
3. Write the necessary SQL commands to the migration file.
4. Follow the specific instructions
- Dont create Down migration, only Up migration.
- Write SQL for Postgres 18.
- When add foreign keys, always add `ON DELETE CASCADE`.
- Add an index on the foreign key columns for better performance.
