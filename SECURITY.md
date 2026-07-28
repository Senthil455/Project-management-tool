# Security Policy

## Reporting a vulnerability

If you find a security vulnerability, please report it privately to the
maintainers rather than opening a public issue. We will acknowledge and work on
a fix as quickly as possible.

## Best practices

- Never commit secrets. The server reads configuration from `server/.env`, which
  is gitignored.
- Sign JWTs using the `JWT_SECRET` environment variable.
- Keep dependencies up to date and review CI failures before merging.
