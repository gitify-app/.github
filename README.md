# Gitify Organization Public Profile

The [public profile](profile/README.md) for [Gitify][gitify-website] organization on GitHub.

## Renovate shared configuration

This repository hosts the organization's shared Renovate preset.

- `default.json` — the baseline preset that every repository inherits via `extends: ["github>gitify-app/.github"]`.
- `renovate-config.json` — the onboarding entry point (`extends: ["./default"]`); Renovate suggests it automatically for new repositories.

### Inheriting and extending

A repository inherits the baseline by extending the shared preset, then adds its own configuration after it. Repository-level settings and later `packageRules` take precedence:

```jsonc
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>gitify-app/.github"],
  "packageRules": [
    { "description": "repo-specific rule" }
  ]
}
```

### Policy

- Weekly updates, with grouped Vite+ and GitHub Actions updates.
- Node runtime tracks LTS only; `@types/node` majors are handled per repository.
- OSV vulnerability alerts on; PR volume capped; no automerge in the baseline.

### Validation

`default.json`, `renovate-config.json`, and any other preset files are validated with `renovate-config-validator --strict` by `.github/workflows/renovate-config-validator.yml`. Consumer repositories call the same reusable workflow to validate their own `renovate.json`.

<!-- LINK LABELS -->
[gitify-website]: https://gitify.io
