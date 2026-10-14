<div align="center">

# 🧩 Gitify Organization

**Community health files** for the [Gitify][gitify-website] organization.

[![License][license-badge]][license]

</div>

> [!NOTE]
> Public repository. It renders the [organization profile](profile/README.md) and hosts the organization's default community health files. The shared [Renovate][renovate] preset now lives in [`gitify-app/renovate-config`][renovate-config].

## 🧩 What lives here

- 🖼️ [Organization profile](profile/README.md) — rendered on the [organization homepage][gitify-org].
- 📋 Organization-wide default community health files (issue & pull request templates and similar).

Shared Renovate configuration moved to ** [`gitify-app/renovate-config`][renovate-config]**, which follows Renovate's [`{org}/renovate-config`][presets] convention and is inherited by every member repository.

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

---

<div align="center">

<sub>Maintained by <a href="https://github.com/orgs/gitify-app/teams/gitify-core">Gitify Core</a> · <a href="https://gitify.io">gitify.io</a></sub>

</div>

<!-- LINK LABELS -->
[gitify-website]: https://gitify.io
[gitify-org]: https://github.com/gitify-app
[renovate]: https://renovatebot.com/
[renovate-config]: https://github.com/gitify-app/renovate-config
[presets]: https://docs.renovatebot.com/config-presets/#grouporganization-level-presets
[license]: LICENSE
[license-badge]: https://img.shields.io/github/license/gitify-app/.github?logo=github
