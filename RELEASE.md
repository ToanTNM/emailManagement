# Release Guide

This document explains the standard release flow, versioning rules, GitHub Actions behavior, and post-release checks for this repository.

## Scope

- Day-to-day development branch: `dev`
- Stable release branch: `main`
- Automatic release by version tag: `git push origin vX.Y.Z`
- Manual release workflow: `Create GitHub Release`

## Versioning Rules

The project uses semantic versioning:

- `MAJOR.MINOR.PATCH`
- Example: `2.0.15`

Conventions:

- Pushing a Git tag such as `v2.0.16` will automatically trigger the release workflow
- When manually triggering GitHub Actions, enter the version without the `v` prefix, for example `2.0.15`
- The workflow will automatically create the corresponding `v2.0.15` tag
- The version heading in `CHANGELOG.md` must also use the format `## [2.0.15] - 2026-04-15`

## Release Artifacts

After pushing a version tag or manually triggering `Create GitHub Release`, the following artifacts are generated automatically:

- Git tag: `vX.Y.Z`
- GitHub Release: titled `vX.Y.Z`
- Windows desktop archive: `OutlookEmail-windows-x64-X.Y.Z.zip`
- Docker image: `ghcr.io/assast/outlookemail:vX.Y.Z`

Additional notes:

- The `latest` / `main` / `dev` tags come from Docker workflows triggered by branch pushes
- The Release workflow is responsible for publishing the `vX.Y.Z` image
- GitHub Release notes are primarily extracted from the matching entry in `CHANGELOG.md`

## Pre-Release Checklist

Before releasing, confirm the following items one by one:

1. The target commit has already been merged into `main`, and `main` is in a releasable state.
2. `VERSION` has been updated to the new version number.
3. `CHANGELOG.md` contains the new release entry, including the date and complete notes.
4. The behavior notes in `README.md`, deployment docs, and upgrade docs do not conflict with the current implementation.
5. If this release changes Docker, Windows `exe`, environment variables, APIs, or frontend behavior, the documentation has been updated accordingly.
6. Local or CI verification has been completed, and at least the core functionality has no obvious regressions.

## Standard Release Steps

### 1. Finish development and validation on `dev`

It is recommended to finish features, fixes, and documentation cleanup on `dev` first, then merge into `main`.

### 2. Merge into `main`

Make sure the commit on `main` is the final code intended for release.

### 3. Update the version number

Synchronize the following files:

- `VERSION`
- `CHANGELOG.md`

Example:

```txt
VERSION            -> 2.0.15
CHANGELOG.md title  -> ## [2.0.15] - 2026-04-15
```

### 4. Commit and push `main`

```bash
git checkout main
git pull
git add VERSION CHANGELOG.md README.md RELEASE.md docs/
git commit -m "docs: prepare release 2.0.15"
git push origin main
```

If the release also includes code changes, include those files in the commit as well.

### 5. Push a version tag to trigger automatic release

```bash
git tag -a v2.0.16 -m "Release v2.0.16"
git push origin v2.0.16
```

After that, the `Create GitHub Release` workflow will run automatically and publish the release.

### 6. Manually trigger the GitHub Release workflow as a fallback

If you do not want to trigger the release by pushing a tag, or if you need to re-publish a specific version, you can also run it manually in GitHub Actions:

- Workflow name: `Create GitHub Release`
- Input parameter: `version`
- Example value: `2.0.15`

Do not enter `v2.0.15`, or the workflow will create an invalid tag.

## What the Workflow Actually Does

The `Create GitHub Release` workflow runs the following stages in order:

### 1. Build the Windows `exe`

- Uses `pyinstaller --noconfirm --clean outlookEmail.spec`
- Packages `dist/OutlookEmail.exe`
- Compresses it together with `README.md` as the release attachment

### 2. Create and push the tag

- When manually triggered, it automatically creates `vX.Y.Z`
- When triggered by a tag push, it reuses the pushed `vX.Y.Z`
- If a tag with the same name already exists and points to the current commit, creation is skipped
- If a tag with the same name exists but points to another commit, the workflow fails and stops the release

### 3. Generate Release Notes

The workflow extracts the current version content from `CHANGELOG.md`:

- Matching format: `## [X.Y.Z]`
- If no match is found, it falls back to a very short default note

Therefore, make sure the `CHANGELOG.md` entry is written before releasing.

### 4. Build and push the Docker version image

The workflow calls `docker-build-push.yml` and builds based on the tag `refs/tags/vX.Y.Z`:

- `ghcr.io/assast/outlookemail:vX.Y.Z`

### 5. Publish the GitHub Release

Finally, a formal Release is created and the Windows archive is uploaded as an attachment.

## Post-Release Checks

It is recommended to verify at least the following items:

1. The GitHub Release page exists, and both the title and body are correct.
2. The release attachment can be downloaded, and the file name includes the current version.
3. The repository tags page contains `vX.Y.Z`.
4. The version image can be pulled from GHCR:

```bash
docker pull ghcr.io/assast/outlookemail:v2.0.15
```

5. If the release includes deployment or API changes, test the upgrade on at least one staging environment.

## Common Issues

### Why is the GitHub Release body incomplete?

Usually because `CHANGELOG.md` does not contain the matching version heading, or the heading format is incorrect. Correct example:

```md
## [2.0.15] - 2026-04-15
```

### Why does the workflow say the tag already exists but the SHA does not match?

That means a tag with the same name already points to another commit. In that case, do not force the release. First confirm:

- Whether the version number was reused
- Whether `main` has additional commits
- Whether a historical tag was created incorrectly

### Why was the `latest` image not refreshed?

Because the Release workflow only publishes the `vX.Y.Z` image. The `latest` / `main` / `dev` images come from branch-push Docker workflows, not from the Release workflow.

## Recommended Release Rhythm

1. Develop and fix issues on `dev` during normal work.
2. Merge into `main` when ready to release.
3. Fill in `CHANGELOG.md` and related docs first, then push the `vX.Y.Z` tag to trigger the automatic release.
4. After release, perform a real deployment test with the `vX.Y.Z` image.
