---
name: create-or-update-command-interactor
description: Create or update use-case of type command (interactor).
---

## When to use this skill
To create or update a command use-case.

## How to use this skill
1. If the interactor command handler or path to it does not exist, create it the `src/modules/<module-name>/interactors/command/<command-name>` directory with the name `<command-name>.handler.ts`.
2. Create `<command-name>.params.ts` next to the handler. Write the input parameters for the command handler in this file.
3. Create `<command-name>.dto.ts` next to the handler. Write the interface outcome of the command handler in this file.
4. Write the command handler in the `<command-name>.handler.ts` file.
5. Make sure you follow project standards for commands to make it consistent with the rest of the project.
6. Следуй правилам
- Не добавляй в dto createdAt
