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

### 🔗 Inheriting and extending

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

### 🛠️ Policy

- 🗓️ Weekly updates, with grouped Vite+ and GitHub Actions updates.
- 🟢 Node runtime tracks LTS only; `@types/node` majors are handled per repository.
- 🛡️ OSV vulnerability alerts on; no automerge in the baseline.

### ✅ Validation

`default.json`, `renovate-config.json`, and any other preset files are validated with `renovate-config-validator --strict` by [`.github/workflows/renovate-config-validator.yml`](.github/workflows/renovate-config-validator.yml). Consumer repositories call the same reusable workflow to validate their own `renovate.json`.

## 🛡️ Shared GitHub Actions security scanning

[`.github/workflows/zizmor.yml`](.github/workflows/zizmor.yml) is a reusable
workflow that checks the **calling repository's** workflows and actions with
zizmor. Checkout does not persist credentials, repository-local zizmor
configuration is discovered normally, and no application scripts are executed.

### Calling the workflow

Add this caller as `.github/workflows/zizmor.yml`. Replace the placeholder with
the **full SHA of a merged provider commit** before using it:

```yaml
name: GitHub Actions Security Analysis

on:
  push:
    branches: [main]
  pull_request:

permissions: {}

jobs:
  zizmor:
    permissions:
      contents: read
      actions: read
      security-events: write
    uses: gitify-app/.github/.github/workflows/zizmor.yml@REPLACE_WITH_FULL_COMMIT_SHA
```

Do not filter pull requests by path: even documentation-only PRs should receive
the check. No inherited secrets or personal token is required.

### Reporting and token permissions

- `advanced-security` is a boolean input, defaulting to `true`. For supported
  same-repository PRs and pushes, findings are uploaded to the **caller's** code
  scanning interface with category `zizmor`. Upload failures remain visible.
- Fork PRs always use annotations instead of uploading SARIF. They run under
  ordinary `pull_request` permissions, without privileged tokens or
  `pull_request_target`. GitHub can require maintainer approval before a fork's
  workflow runs.
- Set `advanced-security: false` when code-scanning uploads are unavailable.
  Annotation mode retains zizmor's failure exit status for findings. SARIF mode
  retains code-scanning gating: a successful scanner job alone does not mean
  there are no findings.

The reusable workflow **intentionally inherits the calling job's permissions**.
GitHub Actions cannot select permissions from an input, and a reusable workflow
cannot elevate the caller's token. Keep `permissions: {}` at the caller's
workflow level and grant only the permissions needed by its calling job.
For annotation-only reporting, that job can use just read access:

```yaml
jobs:
  zizmor:
    permissions:
      contents: read
    uses: gitify-app/.github/.github/workflows/zizmor.yml@REPLACE_WITH_FULL_COMMIT_SHA
    with:
      advanced-security: false
```

### Validation and rollout

Regression tests use Node.js 24+ and no package dependencies:

```sh
node --test tests/zizmor-workflow.test.mjs
actionlint .github/workflows/zizmor.yml .github/workflows/workflow-tests.yml tests/fixtures/*-caller.yml
zizmor --no-online-audits .github/workflows/zizmor.yml tests/fixtures/*-caller.yml
```

The tests evaluate the workflow's boolean reporting expressions for pushes,
same-repository PRs, and fork PRs, and check the provider/caller permission
contract. They are not a substitute for live GitHub upload and fork-PR checks.

Merge the provider first, then open separate caller migrations in website,
GNOME, Gitify, and KDE pinned to its merged SHA. Add this repository's own
SHA-pinned self-scan caller in a follow-up change. Keep these changes separate
from Renovate config work.

Reusable jobs can change the displayed check name (for example,
`zizmor / Run zizmor 🌈`). Review each repository's required checks before
merging; no current required check in the initial rollout references the
duplicated zizmor job. Preserve category `zizmor`, and verify GitHub's analysis
key/check display after migration. Gitify and website have other required
checks, which are unaffected by this migration.

Update provider SHA references through normal dependency PRs; Renovate's
GitHub Actions manager recognizes reusable workflow dependencies. For rollback,
restore the previous local workflow, or revert the new caller in KDE. Keep
provider commits available while consumers still reference them.

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
