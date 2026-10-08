# 🧩 Gitify Organization

[![Renovate enabled][renovate-badge]][renovate] [![Renovate config validation][validator-badge]][validator-actions] [![Conventional Commits][commits-badge]][commits] [![License][license-badge]][license]

> Shared configuration and community health files for the [Gitify][gitify-website] organization.
> See the [organization profile](profile/README.md).

---

## 📦 Shared Renovate configuration

This repository hosts the organization's shared [Renovate][renovate] preset, inherited by every Gitify repository.

| File                   | Purpose                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `default.json`         | Baseline preset every repository inherits via `extends: ["github>gitify-app/.github"]`.         |
| `renovate-config.json` | Onboarding entry point (`extends: ["./default"]`); Renovate suggests it automatically for new repositories. |

## 🔗 Inheriting and extending

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

## 🛠️ Policy

- 🗓️ Weekly updates, with grouped Vite+ and GitHub Actions updates.
- 🟢 Node runtime tracks LTS only; `@types/node` majors are handled per repository.
- 🛡️ OSV vulnerability alerts on; no automerge in the baseline.

## ✅ Validation

`default.json`, `renovate-config.json`, and any other preset files are validated with `renovate-config-validator --strict` by [`.github/workflows/renovate-config-validator.yml`](.github/workflows/renovate-config-validator.yml). Consumer repositories call the same reusable workflow to validate their own `renovate.json`.

## 📄 License

Released under the [MIT License](LICENSE).

<!-- LINK LABELS -->
[gitify-website]: https://gitify.io
[renovate]: https://renovatebot.com/
[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovate&logoColor=white
[validator-actions]: https://github.com/gitify-app/.github/actions/workflows/renovate-config-validator.yml
[validator-badge]: https://img.shields.io/github/actions/workflow/status/gitify-app/.github/renovate-config-validator.yml?logo=github&label=renovate%20config
[commits]: https://www.conventionalcommits.org/
[commits-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?logo=conventionalcommits&logoColor=white
[license]: LICENSE
[license-badge]: https://img.shields.io/github/license/gitify-app/.github?logo=github
