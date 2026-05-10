# Upgrade Guide

This document is for users who are already running this project and explains upgrade steps, backup recommendations, and rollback ideas after a new version is released.

## Recommended Before Upgrading

Before upgrading, it is recommended to do the following:

1. Back up the `data/` directory and keep at least the database file.
2. Record the current image tag, deployment method, and key environment variables.
3. Confirm that the current `SECRET_KEY` will remain unchanged during the upgrade.
4. If you use a reverse proxy or automation script, confirm that ports, domains, and paths do not change after the upgrade.

## Critical Data to Keep

The most important data to preserve during an upgrade is:

- SQLite database: `data/outlook_accounts.db`
- Fixed `SECRET_KEY`
- Custom environment variables

If `SECRET_KEY` changes, stored Refresh Tokens, API Keys, mailbox passwords, and other sensitive data can no longer be decrypted.

## Docker Upgrade

### Upgrade to the Latest Stable Branch Build

```bash
docker pull ghcr.io/assast/outlookemail:latest
docker compose down
docker compose up -d
```

### Upgrade to a Specific Release Version

For production environments, it is recommended to use an explicit version tag:

```bash
docker pull ghcr.io/assast/outlookemail:v2.0.15
docker compose down
docker compose up -d
```

If you use `docker-compose.yml`, you can also update the image directly to the target version:

```yaml
services:
  outlook-mail-reader:
    image: ghcr.io/assast/outlookemail:v2.0.15
```

Then run:

```bash
docker compose up -d
```

## Windows `exe` Upgrade

1. Download the new `OutlookEmail-windows-x64-*.zip` package from GitHub Releases
2. Extract it to a new directory or overwrite the program files in the old directory
3. Keep the existing data directory `%APPDATA%\\OutlookEmail`
4. Launch the new `OutlookEmail.exe`

Notes:

- The data is stored outside the program directory, under `%APPDATA%\\OutlookEmail`
- Do not delete the database or key files in that directory casually

## Direct Python Run Upgrade

```bash
git pull origin main
pip install -r requirements.txt
python web_outlook_app.py
```

If you use a virtual environment, activate it first before running these commands.

## Post-Upgrade Checks

After upgrading, confirm at least the following items:

1. The login page opens normally.
2. Existing accounts, groups, tags, and settings are still present.
3. At least one Outlook account and one IMAP account can still fetch mail correctly.
4. If the external API is enabled, test `/api/external/emails` once.
5. If automatic forwarding or scheduled refresh is enabled, verify that the jobs still run normally.

## Recommended Upgrade Strategy

### Production

- Prefer explicit `vX.Y.Z` version tags
- Test on staging before upgrading production
- Back up the database before upgrading

### Test or Personal Environments

- You can use `latest` directly
- If you want to track development builds, use `dev`

## Rollback Plan

If an issue appears after upgrading, roll back using the same deployment method as before:

### Docker Rollback

```bash
docker pull ghcr.io/assast/outlookemail:v2.0.13
docker compose down
docker compose up -d
```

### Windows Rollback

- Revert to the older `exe`
- Keep the existing data directory unchanged

### Python Rollback

```bash
git checkout <the commit or tag for the old version>
pip install -r requirements.txt
python web_outlook_app.py
```

If the upgrade changed the database structure, confirm whether the old version is compatible with the current database before rolling back.

## Common Questions

### Login stopped working or sensitive data looks wrong after upgrading

First check whether `SECRET_KEY` was changed. This is the most common cause.

### Why do `latest` and the Release image not match after an upgrade?

This is expected:

- `latest` usually points to the most recent successful build from the default branch
- `vX.Y.Z` points to the official release image created during the release process

For production, pin the deployment to a specific version number.
