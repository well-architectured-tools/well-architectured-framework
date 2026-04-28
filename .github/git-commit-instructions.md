# Git Commit Instructions

This project uses Semantic Release. Commits merged into `main` are analyzed automatically, and their messages decide whether a new release is created, what version bump is used, and what appears in `CHANGELOG.md`.

## Format

Use the Conventional Commits format:

```text
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

Rules:

- Use lowercase `type`.
- `scope` is optional, but recommended when it clarifies the changed area (module or lib or feature).
- Keep the subject short, imperative, and specific. Prefer English because release notes are generated from commit messages.
- Put details in the body when the reason, migration path, or risk is not obvious.

## Release Impact

Semantic Release uses the highest impact among all commits since the last release:

| Commit message | Version bump | Use for |
| --- | --- | --- |
| `feat(scope): ...` | minor | New user-visible capability or API behavior |
| `fix(scope): ...` | patch | Bug fix |
| `perf(scope): ...` | patch | Performance improvement without behavior change |
| `chore(deps): ...` | patch | Dependency update; this is a project-specific rule |
| Commit with `BREAKING CHANGE: ...` footer | major | Incompatible API, config, data, or operational change |
| Recognized revert commit | patch | Reverting a released change |

Commits such as `docs`, `test`, `refactor`, `style`, `build`, `ci`, and ordinary `chore` do not create a release by themselves. They can still appear in history, but they should not be used for changes that users need in release notes. If such a commit contains a real breaking change, add the `BREAKING CHANGE:` footer.

## Breaking Changes

For a breaking change, add a blank line after the body and then a footer that starts exactly with `BREAKING CHANGE:`:

```text
feat(api): remove legacy project creation payload

The create-project endpoint now accepts only the normalized request shape.

BREAKING CHANGE: clients must stop sending the legacy project payload fields.
```

Do not rely on `feat!:` or `fix!:` in this repository. The current Semantic Release parser is configured through the Angular convention and reliably recognizes breaking changes through the `BREAKING CHANGE:` footer.

## Examples

```text
feat(enrich): add project catalog import
fix(fastify): return validation error for invalid project name
perf(postgres): batch project lookups
chore(deps): update fastify
docs(readme): clarify local development setup
test(enrich): cover project creation invariants
```

Choose the type by external effect, not by files touched. For example, a database migration that changes required client behavior is `feat(...)` or a breaking change, not `chore(...)`.
