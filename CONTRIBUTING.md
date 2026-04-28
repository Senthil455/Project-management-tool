# Contributing

Thanks for taking the time to contribute! This document describes how to get
your changes merged.

## Development setup

1. Fork and clone the repository.
2. Follow the installation steps in [README.md](./README.md).
3. Create a branch for your work: `git checkout -b feat/my-change`.

## Commit messages

We follow a lightweight [Conventional Commits](https://www.conventionalcommits.org)
style:

```
<type>: <short summary>
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.

Example: `feat: add issue filtering on the board page`.

## Pull requests

- Keep PRs focused on a single concern.
- Add or update tests where it makes sense.
- Make sure the CI workflow passes.
- Reference any related issue (e.g. `Closes #12`).

## Code style

- JavaScript uses 2-space indentation (see `.editorconfig`).
- Run Prettier before committing: `npx prettier --write .`
- Lint with `npm run lint` where configured.
