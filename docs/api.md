# API Documentation

This document is based on the current codebase and is intended to let AI agents, scripts, or external systems integrate with the full API directly instead of relying on fragmented human-only notes.

## AI Integration Overview

- Base URL: `http(s)://<host>:<port>`
- All routes live under `/api/*`
- Two API groups exist:
  - External API: `/api/external/*`, authenticated with an API Key
  - Full management API: all other `/api/*` routes, authenticated with a web session cookie after login
- Write operations use JSON request bodies with `Content-Type: application/json`
- Most endpoints return JSON; a few return file downloads or SSE streams

Recommended integration order:

1. Log in to the web app and keep the session cookie
2. Call `GET /api/csrf-token` to fetch a CSRF token
3. Call read-only endpoints directly with `GET`
4. Include `X-CSRFToken` on write requests

## Endpoint Index

### Basics and Authentication

| Method | Path | Auth | Response | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/version-status` | Session | JSON | Current version vs repository version |
| GET | `/api/csrf-token` | Session | JSON | Get the CSRF token for the current session |

### External API

| Method | Path | Auth | Response | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/external/accounts` | API Key | JSON | Get the mailbox account list |
| GET | `/api/external/emails` | API Key | JSON | Get emails for a mailbox |

### Groups, Accounts, Tags, Projects

| Method | Path | Auth | Response | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/groups` | Session | JSON | Get the group list |
| GET | `/api/groups/<group_id>` | Session | JSON | Get one group |
| POST | `/api/groups` | Session + CSRF | JSON | Create a group |
| PUT | `/api/groups/<group_id>` | Session + CSRF | JSON | Update a group |
| DELETE | `/api/groups/<group_id>` | Session + CSRF | JSON | Delete a group |
| PUT | `/api/groups/reorder` | Session + CSRF | JSON | Reorder groups |
| POST | `/api/export/verify` | Session + CSRF | JSON | Get an export verification token |
| GET | `/api/groups/<group_id>/export` | Session | `text/plain` download | Export one group's accounts |
| GET | `/api/accounts/export` | Session | `text/plain` download | Export all accounts |
| POST | `/api/accounts/export-selected` | Session + CSRF | `text/plain` download | Export selected groups |
| GET | `/api/accounts` | Session | JSON | Get account list |
| GET | `/api/accounts/search` | Session | JSON | Search accounts |
| GET | `/api/accounts/<account_id>` | Session | JSON | Get one account |
| POST | `/api/accounts` | Session + CSRF | JSON | Bulk import accounts |
| PUT | `/api/accounts/<account_id>` | Session + CSRF | JSON | Update an account |
| DELETE | `/api/accounts/<account_id>` | Session + CSRF | JSON | Delete account by ID |
| DELETE | `/api/accounts/email/<email_addr>` | Session + CSRF | JSON | Delete account by email |
| POST | `/api/accounts/batch-delete` | Session + CSRF | JSON | Bulk delete accounts |
| GET | `/api/accounts/<account_id>/aliases` | Session | JSON | Get aliases for one account |
| PUT | `/api/accounts/<account_id>/aliases` | Session + CSRF | JSON | Replace all aliases for one account |
| POST | `/api/accounts/batch-update-group` | Session + CSRF | JSON | Bulk update groups |
| POST | `/api/accounts/batch-update-forwarding` | Session + CSRF | JSON | Bulk toggle forwarding |
| GET | `/api/tags` | Session | JSON | Get tags |
| POST | `/api/tags` | Session + CSRF | JSON | Create a tag |
| DELETE | `/api/tags/<tag_id>` | Session + CSRF | JSON | Delete a tag |
| POST | `/api/accounts/tags` | Session + CSRF | JSON | Bulk update account tags |
| GET | `/api/projects` | Session | JSON | Get project list |
| GET | `/api/projects/<project_key>` | Session | JSON | Get project details |
| POST | `/api/projects/start` | Session + CSRF | JSON | Create or complete a project scope |
| GET | `/api/projects/<project_key>/accounts` | Session | JSON | Get project accounts |
| POST | `/api/projects/<project_key>/claim-random` | Session + CSRF | JSON | Claim one random project mailbox |
| POST | `/api/projects/<project_key>/complete-success` | Session + CSRF | JSON | Mark a claimed mailbox as success |
| POST | `/api/projects/<project_key>/complete-failed` | Session + CSRF | JSON | Mark a claimed mailbox as failed |
| POST | `/api/projects/<project_key>/release` | Session + CSRF | JSON | Release a claimed mailbox |
| POST | `/api/projects/<project_key>/reset-failed` | Session + CSRF | JSON | Reset failed to claimable |
| POST | `/api/projects/<project_key>/remove-account` | Session + CSRF | JSON | Remove a mailbox from the project |
| POST | `/api/projects/<project_key>/restore-account` | Session + CSRF | JSON | Restore a removed mailbox |

### Refresh, Logs, Mail, Settings, Temporary Mailboxes

| Method | Path | Auth | Response | Description |
| --- | --- | --- | --- | --- |
| POST | `/api/accounts/<account_id>/refresh` | Session + CSRF | JSON | Refresh one Outlook account |
| POST | `/api/accounts/refresh-selected` | Session + CSRF | JSON | Refresh selected accounts |
| POST | `/api/accounts/refresh-selected-stream` | Session + CSRF | JSON | Initialize a stream refresh task for selected accounts |
| GET | `/api/accounts/refresh-selected-stream/<task_id>` | Session | `text/event-stream` | Subscribe to the stream refresh task |
| GET | `/api/accounts/refresh-all` | Session | `text/event-stream` | Refresh all accounts |
| POST | `/api/accounts/<account_id>/retry-refresh` | Session + CSRF | JSON | Retry one failed refresh |
| GET | `/api/accounts/refresh-failed-stream` | Session | `text/event-stream` | Stream retry for failed accounts |
| POST | `/api/accounts/refresh-failed` | Session + CSRF | JSON | Retry failed accounts |
| GET | `/api/accounts/trigger-scheduled-refresh` | Session | `text/event-stream` | Manually trigger scheduled refresh |
| POST | `/api/accounts/stop-full-refresh` | Session + CSRF | JSON | Stop the current full refresh task |
| GET | `/api/accounts/refresh-logs` | Session | JSON | Refresh log list |
| GET | `/api/accounts/<account_id>/refresh-logs` | Session | JSON | Refresh logs for one account |
| GET | `/api/accounts/refresh-logs/failed` | Session | JSON | Snapshot of failed accounts |
| GET | `/api/accounts/refresh-stats` | Session | JSON | Refresh statistics |
| GET | `/api/accounts/refresh-status-list` | Session | JSON | Data for the refresh management page |
| GET | `/api/accounts/forwarding-logs` | Session | JSON | Forwarding log list |
| GET | `/api/accounts/forwarding-logs/failed` | Session | JSON | Recent failed forwarding records |
| GET | `/api/accounts/<account_id>/forwarding-logs` | Session | JSON | Forwarding logs for one account |
| POST | `/api/accounts/trigger-forwarding-check` | Session + CSRF | JSON | Trigger one forwarding check immediately |
| POST | `/api/accounts/<account_id>/forwarding/reset-cursor` | Session + CSRF | JSON | Reset one account's forwarding cursor |
| GET | `/api/emails/<email_addr>` | Session | JSON | Get internal mail list |
| POST | `/api/emails/mark-read` | Session + CSRF | JSON | Bulk mark emails as read |
| POST | `/api/emails/delete` | Session + CSRF | JSON | Bulk delete emails |
| GET | `/api/email/<email_addr>/<message_id>` | Session | JSON | Get email details |
| GET | `/api/email/<email_addr>/<message_id>/attachments/<attachment_id>` | Session | File stream | Download one attachment |
| GET | `/api/email/<email_addr>/<message_id>/attachments/download-all` | Session | ZIP stream | Download all attachments as a ZIP |
| GET | `/api/temp-emails` | Session | JSON | Get temporary mailbox list |
| POST | `/api/temp-emails/import` | Session + CSRF | JSON | Bulk import temporary mailboxes |
| POST | `/api/temp-emails/batch-delete` | Session + CSRF | JSON | Bulk delete temporary mailboxes |
| POST | `/api/temp-emails/tags` | Session + CSRF | JSON | Bulk update temporary mailbox tags |
| GET | `/api/duckmail/domains` | Session | JSON | Get DuckMail domains |
| GET | `/api/cloudflare/domains` | Session | JSON | Get Cloudflare domains |
| POST | `/api/temp-emails/generate` | Session + CSRF | JSON | Generate a temporary mailbox |
| DELETE | `/api/temp-emails/<email_addr>` | Session + CSRF | JSON | Delete a temporary mailbox |
| GET | `/api/temp-emails/<email_addr>/messages` | Session | JSON | Get messages for a temporary mailbox |
| GET | `/api/temp-emails/<email_addr>/messages/<message_id>` | Session | JSON | Get one temporary mail message |
| DELETE | `/api/temp-emails/<email_addr>/messages/<message_id>` | Session + CSRF | JSON | Delete one temporary mail message, currently disabled |
| DELETE | `/api/temp-emails/<email_addr>/clear` | Session + CSRF | JSON | Clear a temporary mailbox, currently disabled |
| POST | `/api/temp-emails/<email_addr>/refresh` | Session + CSRF | JSON | Refresh a temporary mailbox manually |
| GET | `/api/oauth/auth-url` | Session | JSON | Generate a Microsoft OAuth authorization URL |
| POST | `/api/oauth/exchange-token` | Session + CSRF | JSON | Exchange a callback URL for a Refresh Token |
| POST | `/api/settings/validate-cron` | Session + CSRF | JSON | Validate a Cron expression |
| GET | `/api/settings` | Session | JSON | Get system settings |
| PUT | `/api/settings` | Session + CSRF | JSON | Update system settings |
| POST | `/api/settings/test-forward-channel` | Session + CSRF | JSON | Test a forwarding channel directly |

## Authentication

### External API

The external API uses API Key authentication and supports two forms:

- Header: `X-API-Key: your-api-key`
- Query: `?api_key=your-api-key`

You can configure it in the web UI under `Settings -> External API Key`.

### Full API

The full API requires logging in to the web UI first and sending the session cookie.

### CSRF

All internal write requests should include `X-CSRFToken`, with the token obtained from `GET /api/csrf-token`.

Typical headers:

```http
Content-Type: application/json
X-CSRFToken: <csrf-token>
Cookie: session=<session-cookie>
```

### General Response Conventions

Most JSON endpoints follow these rules:

- `success=true` means the request succeeded overall
- `success=false` means the request failed, usually with `error` or `message`
- Some endpoints also return:
  - `partial=true`: partial success
  - `details`: more detailed failure reasons
  - `total`, `count`, `items`: list or statistics data
- Uncaught exceptions return:
  - HTTP `500`
  - `{"success": false, "error": "<exception message>"}`
- Email, IMAP, and Graph endpoints may return `error` as either a string or a structured object:

```json
{
  "code": "IMAP_CONNECT_FAILED",
  "message": "IMAP connection failed",
  "type": "IMAPConnectError",
  "status": 502,
  "details": "",
  "trace_id": "..."
}
```

Clients should check `success` first and then handle `error` as either a string or an object.

### GET `/api/csrf-token`

Returns the CSRF token bound to the current session. The endpoint requires login, and the token is tied to the active session.

Success example:

```json
{
  "csrf_token": "...",
  "csrf_disabled": false
}
```

If CSRF is disabled, it returns:

```json
{
  "csrf_token": null,
  "csrf_disabled": true
}
```

The response is marked as non-cacheable and includes `Vary: Cookie`. Do not reuse this token across sessions.

### GET `/api/version-status`

Returns the comparison between the current running version and the latest repository version.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `refresh` | bool-like string | No | When set to `1`, `true`, or `yes`, refresh the remote version cache |

#### Success example

```json
{
  "success": true,
  "version_status": {
    "current_version": "v2.0.15",
    "latest_version": "v2.0.16",
    "latest_release_version": "v2.0.16",
    "latest_repository_version": "v2.0.16",
    "status": "update_available",
    "badge_label": "Update available",
    "hint": "New version v2.0.16 found",
    "source": "release",
    "update_url": "https://...",
    "release_url": "https://...",
    "repository_url": "https://...",
    "changelog_url": "https://...",
    "checked_at": "2026-05-01T05:00:00+00:00",
    "errors": []
  }
}
```

Common values for `version_status.status`:

- `update_available`
- `up_to_date`
- `ahead`
- `unknown`

## Mailbox Aliases

Regular accounts can configure multiple alias addresses.

- The external API and internal mail APIs can resolve either the primary email or an alias to the same account
- Responses may include:
  - `requested_email`: the email passed in the request
  - `resolved_email`: the primary email that was actually matched
  - `matched_alias`: the alias that matched, if any
- Alias addresses support common special characters such as `+`, `@`, and `&`
  - `@` can be used directly
  - `+` should be URL encoded as `%2B`
  - `&` must be encoded as `%26`

Typical flow:

1. Automatically forward external mailbox B to managed mailbox A
2. Configure mailbox B as an alias under mailbox A
3. Later, call the API with mailbox B as the `email` parameter to read mail or verification codes

## External API

### GET `/api/external/accounts`

Returns the managed mailbox account list, which is useful when an external system wants to sync the mailbox pool first and then fetch mail from `/api/external/emails`.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `group_id` | int | No | Only return accounts in the specified group |
| `limit` | int | No | Page size, max `10000`; if omitted, all matches are returned for backward compatibility |
| `offset` | int | No | Pagination offset, default `0` |
| `sort_by` | string | No | Sort field, supports `created_at`, `email`, `sort_order` |
| `sort_order` | string | No | Sort direction, `asc` or `desc`, default `desc` |
| `tag_ids` | string | No | Comma-separated tag IDs; only accounts with any of these tags are returned |
| `include_untagged` | bool | No | Used with `tag_ids` to include untagged accounts |

#### Request example

```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:5000/api/external/accounts"

curl -H "X-API-Key: your-api-key" \
  "http://localhost:5000/api/external/accounts?group_id=1"
```

#### Success example

```json
{
  "success": true,
  "total": 1,
  "accounts": [
    {
      "id": 1,
      "email": "user@outlook.com",
      "aliases": ["alias@example.com"],
      "alias_count": 1,
      "group_id": 1,
      "group_name": "Default Group",
      "group_color": "#666666",
      "remark": "Primary account",
      "status": "active",
      "account_type": "outlook",
      "provider": "outlook",
      "forward_enabled": true,
      "last_refresh_at": "2026-04-09 14:20:00",
      "last_refresh_status": "success",
      "last_refresh_error": null,
      "created_at": "2026-04-09 14:00:00",
      "updated_at": "2026-04-09 14:20:00",
      "tags": [
        {
          "id": 1,
          "name": "Core",
          "color": "#1a1a1a"
        }
      ]
    }
  ]
}
```

#### Notes

- This endpoint returns only regular mailbox accounts, not temporary mailboxes
- Sensitive fields such as passwords, Refresh Tokens, and IMAP passwords are hidden
- To fetch mail for one mailbox, call `/api/external/emails`

### GET `/api/external/emails`

Returns the email list for a mailbox. Supports primary email, alias email, and aggregated inbox/junk queries.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | Yes | Primary or alias email. If it contains `+`, the full address is matched first, then the local part is progressively trimmed from right to left by `+suffix` for fallback matching |
| `folder` | string | No | `inbox`, `junkemail`, `deleteditems`, `all`. `all` fetches inbox and junk mail together and merges them in descending time order |
| `skip` | int | No | Pagination offset, default `0`. When `folder=all`, this is applied per folder |
| `top` | int | No | Number of results, default `1`, max `50`. When `folder=all`, this is applied per folder |
| `subject_contains` | string | No | Keep only emails whose subject contains the keyword |
| `from_contains` | string | No | Keep only emails whose sender contains the keyword |
| `keyword` | string | No | Further keyword filtering across subject, preview, and body |

#### Request example

```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:5000/api/external/emails?email=user@outlook.com&folder=inbox"

curl -H "X-API-Key: your-api-key" \
  "http://localhost:5000/api/external/emails?email=alias@example.com&folder=all&top=10"

curl -H "X-API-Key: your-api-key" \
  "http://localhost:5000/api/external/emails?email=alias@example.com&folder=all&top=10&subject_contains=verify&from_contains=github&keyword=reset"

curl -H "X-API-Key: your-api-key" \
  "http://localhost:5000/api/external/emails?email=user%2Balias%40example.com"
```

#### Success example

```json
{
  "success": true,
  "requested_email": "alias@example.com",
  "resolved_email": "user@outlook.com",
  "matched_alias": "alias@example.com",
  "method": "Graph API",
  "has_more": true,
  "emails": [
    {
      "id": "AAMk...",
      "subject": "Your verification code",
      "from": "no-reply@example.com",
      "date": "2026-04-09T14:20:00Z",
      "is_read": false,
      "has_attachments": false,
      "body_preview": "Your code is 123456",
      "folder": "inbox"
    }
  ]
}
```

#### Aggregated mode

When `folder=all`:

- The backend fetches `inbox` and `junkemail` at the same time
- `top` means "how many to fetch from each folder"
- For example, `top=1` can return at most 2 emails total
- `skip` is also applied per folder
- The result is merged and sorted by normalized email time in descending order
- For IMAP, the server-reported `INTERNALDATE` is preferred; timestamps like `Tue, 14 Apr 2026 08:20:50 +0000 (UTC)` are also supported
- Each email includes its `folder`
- If one folder succeeds and the other fails, the API returns:
  - `success: true`
  - `partial: true`
  - `details` with the failed folder error

## Internal API

## Group Management

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| GET | `/api/groups` | None | Get all groups with `account_count` and `sort_position` |
| GET | `/api/groups/<group_id>` | Path param `group_id` | Get one group |
| POST | `/api/groups` | JSON: `name`, `description?`, `color?`, `proxy_url?`, `sort_position?` | Create a group |
| PUT | `/api/groups/<group_id>` | JSON: `name`, `description?`, `color?`, `proxy_url?`, `sort_position?` | Update a group |
| DELETE | `/api/groups/<group_id>` | Path param `group_id` | Delete a group; the default group cannot be deleted |
| PUT | `/api/groups/reorder` | JSON: `group_ids: number[]` | Reorder regular groups |

Example create/update payload:

```json
{
  "name": "Proxy Group",
  "description": "Routes through Hong Kong proxy",
  "color": "#1a1a1a",
  "proxy_url": "http://127.0.0.1:7890",
  "sort_position": 2
}
```

## Export and Double Check

Every export endpoint first checks the login password. After you obtain `verify_token`, you can start the export. The `verify_token` is one-time use and valid for 5 minutes by default.

| Method | Path | Parameters | Returns |
| --- | --- | --- | --- |
| POST | `/api/export/verify` | JSON: `password` | JSON, returns `verify_token` |
| GET | `/api/groups/<group_id>/export` | Query: `verify_token` | `text/plain` file download |
| GET | `/api/accounts/export` | Query: `verify_token` | `text/plain` file download |
| POST | `/api/accounts/export-selected` | JSON: `group_ids: number[]`, `verify_token` | `text/plain` file download |

Example verification request:

```json
{
  "password": "your-login-password"
}
```

Example success response:

```json
{
  "success": true,
  "verify_token": "..."
}
```

## Account Management

### GET `/api/accounts`

Get the account list.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `group_id` | int | No | Only return accounts in the specified group |

#### Key response fields

| Field | Description |
| --- | --- |
| `accounts` | Accounts in the current page |
| `total` | Total number of accounts matching the query |
| `limit` | Actual page size used |
| `offset` | Current offset |
| `has_more` | Whether another page exists |
| `aliases` | Alias list |
| `alias_count` | Number of aliases |
| `forward_enabled` | Whether forwarding is enabled |
| `last_refresh_at` | Most recent refresh time |
| `last_refresh_status` | Most recent refresh result |
| `last_refresh_error` | Most recent refresh error |
| `tags` | Tag list |

### GET `/api/accounts/search`

Search accounts.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `q` | string | Yes | Search keyword, supports primary email, remark, tags, and alias email |
| `limit` | int | No | Page size, max `10000` |
| `offset` | int | No | Pagination offset, default `0` |
| `sort_by` | string | No | Sort field, supports `created_at`, `email`, `sort_order` |
| `sort_order` | string | No | Sort direction, `asc` or `desc`, default `desc` |
| `tag_ids` | string | No | Comma-separated tag IDs; only accounts with any of these tags are returned |
| `include_untagged` | bool | No | Used with `tag_ids` to include untagged accounts |

### POST `/api/accounts`

Bulk import accounts.

#### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account_string` | string | Yes | Multi-line account text |
| `group_id` | int | No | Target group, default `1` |
| `account_format` | string | No | Outlook import format: `client_id_refresh_token` or `refresh_token_client_id` |
| `provider` | string | No | `outlook`, `auto`, `qq`, `163`, `126`, `yahoo`, `aliyun`, `custom` |
| `imap_host` | string | No | IMAP server when `provider=custom` |
| `imap_port` | int | No | IMAP port when `provider=custom` |
| `forward_enabled` | bool | No | Whether forwarding is enabled after import |

#### Key response fields

| Field | Description |
| --- | --- |
| `added_count` | Number of newly added accounts |
| `skipped_count` | Number of skipped accounts due to duplicates, etc. |
| `invalid_count` | Number of invalid input lines |

#### Import formats

- Outlook: `email----password----ClientID----RefreshToken` per line
- Outlook reverse order: `email----password----RefreshToken----ClientID`, with `account_format=refresh_token_client_id`
- Non-Outlook IMAP: `email----IMAP password`
- Custom IMAP: `email----IMAP password----IMAP host----IMAP port`

#### Request example

```json
{
  "account_string": "user@outlook.com----password----client-id----refresh-token",
  "group_id": 1,
  "account_format": "client_id_refresh_token",
  "provider": "outlook",
  "forward_enabled": false
}
```

### GET `/api/accounts/<account_id>`

Get one account in detail.

#### Additional response fields

```json
{
  "success": true,
  "account": {
    "id": 1,
    "email": "user@outlook.com",
    "aliases": ["alias@example.com", "login@example.com"],
    "alias_count": 2,
    "matched_alias": "",
    "forward_enabled": true
  }
}
```

### PUT `/api/accounts/<account_id>`

Update account information.

- If the request body contains only `status`, only the account status is updated
- Supports both Outlook and IMAP accounts
- Aliases can now be saved together with the account update

#### Common request fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | Yes | Mailbox address |
| `password` | string | No | Account password, Outlook can be empty |
| `client_id` | string | Required for Outlook | Outlook Client ID |
| `refresh_token` | string | Required for Outlook | Outlook Refresh Token |
| `account_type` | string | No | `outlook` or `imap` |
| `provider` | string | No | `outlook`, `auto`, `qq`, `163`, `126`, `yahoo`, `aliyun`, `custom` |
| `imap_host` | string | Required for custom IMAP | Custom IMAP server |
| `imap_port` | int | No | IMAP port |
| `imap_password` | string | Required for IMAP | IMAP password |
| `group_id` | int | No | Group ID |
| `remark` | string | No | Remark |
| `status` | string | No | Status value such as `active` |
| `forward_enabled` | bool | No | Whether forwarding is enabled |
| `aliases` | array<string> | No | Alias list; if provided, it replaces the current list |

#### Request example

```json
{
  "email": "user@outlook.com",
  "client_id": "xxx",
  "refresh_token": "xxx",
  "group_id": 1,
  "remark": "Primary account",
  "status": "active",
  "forward_enabled": true,
  "aliases": [
    "alias@example.com",
    "login@example.com"
  ]
}
```

### POST `/api/accounts/batch-update-group`

Bulk update account groups.

#### Request example

```json
{
  "account_ids": [1, 2, 3],
  "group_id": 5
}
```

### POST `/api/accounts/batch-update-forwarding`

Bulk enable or disable account forwarding.

#### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account_ids` | array<int> | Yes | List of account IDs |
| `forward_enabled` | bool | Yes | `true` to enable forwarding, `false` to disable it |

#### Request example

```json
{
  "account_ids": [1, 2, 3],
  "forward_enabled": true
}
```

#### Key response fields

| Field | Description |
| --- | --- |
| `updated_count` | Number of accounts whose status changed |
| `updated_accounts` | List of updated accounts |
| `unchanged_count` | Number of accounts already in the target state |
| `missing_ids` | Missing account IDs |

### GET `/api/accounts/<account_id>/aliases`

Get the alias list for one account.

### PUT `/api/accounts/<account_id>/aliases`

Replace the alias list for one account.

#### Request example

```json
{
  "aliases": [
    "alias@example.com",
    "login@example.com"
  ]
}
```

### DELETE `/api/accounts/<account_id>`

Delete an account by ID.

### DELETE `/api/accounts/email/<email_addr>`

Delete an account by email address.

### POST `/api/accounts/batch-delete`

Bulk delete accounts.

#### Request body

```json
{
  "account_ids": [1, 2, 3]
}
```

#### Key response fields

| Field | Description |
| --- | --- |
| `deleted_count` | Number actually deleted |
| `deleted_accounts` | List of deleted accounts |
| `missing_ids` | Account IDs that were requested but not found |

## Tag Management

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| GET | `/api/tags` | None | Get all tags |
| POST | `/api/tags` | JSON: `name`, `color?` | Create a tag |
| DELETE | `/api/tags/<tag_id>` | Path param `tag_id` | Delete a tag |
| POST | `/api/accounts/tags` | JSON: `account_ids`, `tag_id`, `action` | Bulk add/remove tags on accounts |
| POST | `/api/temp-emails/tags` | JSON: `temp_email_ids`, `tag_id`, `action` | Bulk add/remove tags on temporary mailboxes |

Bulk account tag example:

```json
{
  "account_ids": [1, 2, 3],
  "tag_id": 8,
  "action": "add"
}
```

Temporary mailbox tag example:

```json
{
  "temp_email_ids": [11, 12],
  "tag_id": 8,
  "action": "remove"
}
```

## Project Management

Project APIs manage the independent status of a mailbox within a project by `project_key`.

- The same mailbox can exist in multiple projects at once
- Project status is tracked independently and does not affect other projects
- Current statuses are:
  - `toClaim`: claimable
  - `claiming`: being claimed
  - `done`: successfully consumed and no longer assigned automatically
  - `failed`: most recent attempt failed; manual reset is required before re-assignment
  - `removed`: manually removed from the project scope
  - `deleted`: the account was deleted from the system master table, but project history is preserved

### GET `/api/projects`

Get the project list.

#### Success example

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "GPT Registration",
        "project_key": "gpt",
        "description": "GPT registration project",
        "scope_mode": "groups",
        "use_alias_email": false,
        "status": "active",
        "group_ids": [1, 2],
        "total_count": 500,
        "to_claim_count": 120,
        "claiming_count": 5,
        "failed_count": 8,
        "done_count": 360,
        "removed_count": 15,
        "deleted_count": 3,
        "last_scope_synced_at": "2026-04-15T09:30:00+00:00",
        "created_at": "2026-04-10 08:00:00",
        "updated_at": "2026-04-15T09:30:00+00:00"
      }
    ]
  }
}
```

### GET `/api/projects/<project_key>`

Get one project in detail.

### POST `/api/projects/start`

Start a project.

This endpoint combines project creation and scope completion:

- If `project_key` does not exist:
  - Create the project
  - Save the scope
  - Add scoped mailboxes to the project
- If `project_key` already exists:
  - Treat it as starting the same project again
  - Reuse the current scope by default
  - If `group_ids` is explicitly provided in this request, update the scope and then complete it
  - Only add new mailboxes; do not reset existing status

Deletion compensation rules:

- When starting a project, the system checks project history for missing accounts
- If the corresponding account no longer exists in `accounts`, that project record is marked `deleted`
- If the same email is imported again later, the project startup logic reuses the old project record by email address instead of treating it as a completely new mailbox

Alias mailbox rules:

- When `use_alias_email=false`, the project uses the primary email address for pooling
- When `use_alias_email=true`, alias addresses are preferred for pooling
- If an account has no aliases, the primary email is still used as a fallback even when `use_alias_email=true`
- When restarting an existing project, if `use_alias_email` is not explicitly provided, the current project configuration is kept

#### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `project_key` | string | Yes | Project identifier, trimmed and converted to lowercase internally |
| `name` | string | No | Project name; if omitted on first creation, defaults to `project_key` |
| `description` | string | No | Project description |
| `group_ids` | array<int> | No | Scope groups; if omitted, first creation defaults to all mailboxes |
| `use_alias_email` | bool | No | Whether alias mailboxes should be pooled first; defaults to `false` |

#### Request examples

Create a scoped project:

```json
{
  "project_key": "gpt",
  "name": "GPT Registration",
  "description": "GPT registration project",
  "group_ids": [1, 2],
  "use_alias_email": true
}
```

Create a full-scope project:

```json
{
  "project_key": "google",
  "name": "Google Registration"
}
```

Start an existing project again:

```json
{
  "project_key": "gpt"
}
```

#### Success example

```json
{
  "success": true,
  "message": "Project started",
  "data": {
    "id": 1,
    "name": "GPT Registration",
    "project_key": "gpt",
    "description": "GPT registration project",
    "scope_mode": "groups",
    "use_alias_email": true,
    "status": "active",
    "group_ids": [1, 2],
    "total_count": 560,
    "to_claim_count": 120,
    "claiming_count": 5,
    "failed_count": 8,
    "done_count": 360,
    "removed_count": 15,
    "deleted_count": 3,
    "created": false,
    "added_count": 128
  }
}
```

#### Key response fields

| Field | Description |
| --- | --- |
| `created` | Whether this was the first creation of the project |
| `added_count` | Number of newly added mailboxes during this start |
| `deleted_count` | Number of project mailboxes marked as `deleted` during this run |
| `use_alias_email` | Whether the project currently pools alias mailboxes |

### GET `/api/projects/<project_key>/accounts`

Get the mailbox list for one project.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | string | No | Filter by project status such as `toClaim`, `failed`, `done` |
| `group_id` | int | No | Filter by current group or source group |
| `provider` | string | No | Filter by mailbox provider |
| `keyword` | string | No | Fuzzy search over mailbox address and remark |

#### Success example

```json
{
  "success": true,
  "data": {
      "project": {
        "id": 1,
        "name": "GPT Registration",
        "project_key": "gpt",
        "description": "GPT registration project",
        "scope_mode": "groups",
        "use_alias_email": true,
        "status": "active",
        "group_ids": [1, 2],
      "total_count": 560,
      "to_claim_count": 120,
      "claiming_count": 5,
      "failed_count": 8,
      "done_count": 360,
      "removed_count": 15,
      "deleted_count": 3
    },
    "accounts": [
      {
        "project_account_id": 101,
        "account_id": 12,
        "email": "alias@example.com",
        "primary_email": "user@example.com",
        "normalized_email": "alias@example.com",
        "provider": "outlook",
        "account_type": "outlook",
        "group_id": 1,
        "group_name": "Default Group",
        "remark": "",
        "project_status": "failed",
        "account_status": "active",
        "caller_id": "",
        "task_id": "",
        "claim_token": "",
        "claimed_at": "",
        "lease_expires_at": "",
        "last_result": "failed",
        "last_result_detail": "provider blocked",
        "claim_count": 2,
        "first_claimed_at": "2026-04-15T09:30:00+00:00",
        "last_claimed_at": "2026-04-15T09:35:00+00:00",
        "done_at": "",
        "created_at": "2026-04-15T09:20:00+00:00",
        "updated_at": "2026-04-15T09:36:00+00:00"
      }
    ]
  }
}
```

### POST `/api/projects/<project_key>/claim-random`

Randomly claim one available mailbox from the project.

The current implementation picks one mailbox with `status='toClaim'` inside the project and makes sure the mailbox is not already occupied by a `claiming` record in another project.

#### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `caller_id` | string | Yes | Caller identifier |
| `task_id` | string | Yes | Current task identifier |
| `lease_seconds` | int | No | Lease time in seconds, default `600`, max `3600` |

#### Request example

```json
{
  "caller_id": "worker-1",
  "task_id": "task-001",
  "lease_seconds": 600
}
```

#### Success example

```json
{
  "success": true,
  "data": {
    "project_key": "gpt",
    "project_account_id": 101,
    "account_id": 12,
    "email": "alias@example.com",
    "primary_email": "user@example.com",
    "group_id": 1,
    "provider": "outlook",
    "account_type": "outlook",
    "remark": "",
    "claim_token": "pclm_xxx",
    "claimed_at": "2026-04-15T10:00:00+00:00",
    "lease_expires_at": "2026-04-15T10:10:00+00:00"
  }
}
```

If no mailbox is available, the current implementation returns:

```json
{
  "success": false,
  "error": "No claimable project mailboxes are available"
}
```

### POST `/api/projects/<project_key>/complete-success`

Mark the currently claimed project mailbox as successful.

#### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account_id` | int | Yes | Account ID |
| `claim_token` | string | Yes | Token returned at claim time |
| `caller_id` | string | No | Caller identifier |
| `task_id` | string | No | Task identifier |
| `detail` | string | No | Success note |

### POST `/api/projects/<project_key>/complete-failed`

Mark the currently claimed project mailbox as failed.

- Status changes from `claiming` to `failed`
- `failed` will not re-enter assignment automatically
- It must be manually reset through `/reset-failed` before it can be claimed again

#### Request example

```json
{
  "account_id": 12,
  "claim_token": "pclm_xxx",
  "caller_id": "worker-1",
  "task_id": "task-001",
  "detail": "provider blocked"
}
```

### POST `/api/projects/<project_key>/release`

Manually release the mailbox currently in `claiming`.

- Status returns from `claiming` to `toClaim`
- Suitable for task interruption or voluntary abandonment

### POST `/api/projects/<project_key>/reset-failed`

Manually reset a `failed` mailbox back to `toClaim`.

#### Request example

```json
{
  "account_id": 12,
  "detail": "Manual retry allowed"
}
```

### POST `/api/projects/<project_key>/remove-account`

Manually remove a project mailbox from the project.

- The target status becomes `removed`
- If the current status is `claiming`, removal is rejected

#### Request example

```json
{
  "account_id": 12,
  "detail": "Removed from project manually"
}
```

### POST `/api/projects/<project_key>/restore-account`

Manually restore a `removed` project mailbox back to `toClaim`.

#### Request example

```json
{
  "account_id": 12,
  "detail": "Restored to the project manually"
}
```

## Refresh and Forwarding Operations

### Token Refresh

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| POST | `/api/accounts/<account_id>/refresh` | Path param `account_id` | Refresh one Outlook account token |
| POST | `/api/accounts/refresh-selected` | JSON: `account_ids: number[]` | Refresh selected Outlook accounts and skip IMAP or missing accounts |
| POST | `/api/accounts/refresh-selected-stream` | JSON: `account_ids: number[]` | Initialize a stream refresh task for selected accounts and return `task_id` and `stream_url` |
| GET | `/api/accounts/refresh-selected-stream/<task_id>` | Path param `task_id` | Subscribe to the selected-account stream refresh task as `text/event-stream` |
| GET | `/api/accounts/refresh-all` | None | Refresh all Outlook accounts and return `text/event-stream` |
| POST | `/api/accounts/<account_id>/retry-refresh` | Path param `account_id` | Retry one failed refresh |
| GET | `/api/accounts/refresh-failed-stream` | None | Stream retry for currently failed accounts as `text/event-stream` |
| POST | `/api/accounts/refresh-failed` | None | Retry the accounts that failed last time |
| GET | `/api/accounts/trigger-scheduled-refresh` | Query: `force=true/false` | Manually trigger scheduled refresh and return `text/event-stream` |
| POST | `/api/accounts/stop-full-refresh` | None | Request cancellation of the current full refresh task |

`/api/accounts/refresh-all`, `/api/accounts/refresh-failed-stream`, `/api/accounts/refresh-selected-stream/<task_id>`, and `/api/accounts/trigger-scheduled-refresh` all return SSE event streams. Common event types include:

- `start`
- `progress`
- `delay`
- `complete`

Selected-account stream refresh must be initialized first:

```json
{
  "account_ids": [1, 2, 3]
}
```

`POST /api/accounts/refresh-selected-stream` returns:

```json
{
  "success": true,
  "task_id": "task-token",
  "stream_url": "/api/accounts/refresh-selected-stream/task-token"
}
```

Then subscribe to `stream_url` using `EventSource`. This task uses short-lived in-process state, so deployment must stay on a single worker. If the task is missing or expired, SSE returns a `type=error` event.

`POST /api/accounts/stop-full-refresh` returns:

```json
{
  "success": true,
  "message": "Cancellation requested for the current full refresh task"
}
```

If there is no running full refresh task, it returns HTTP `409`:

```json
{
  "success": false,
  "message": "There is no full refresh task running right now"
}
```

`POST /api/accounts/refresh-selected` request example:

```json
{
  "account_ids": [1, 2, 3]
}
```

This endpoint returns:

- `requested_count`
- `processed_count`
- `success_count`
- `failed_count`
- `skipped_count`
- `failed_list`
- `skipped_list`

### Refresh Logs and Statistics

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| GET | `/api/accounts/refresh-logs` | Query: `limit`, `offset` | Get all refresh logs |
| GET | `/api/accounts/<account_id>/refresh-logs` | Query: `limit`, `offset` | Get refresh logs for one account |
| GET | `/api/accounts/refresh-logs/failed` | None | Get the current failed-account snapshot |
| GET | `/api/accounts/refresh-stats` | None | Get the current refresh statistics snapshot |
| GET | `/api/accounts/refresh-status-list` | Query: `q`, `status`, `page`, `page_size` | Get the mailbox list for the refresh management page |

`GET /api/accounts/refresh-logs/failed` returns the snapshot of mailboxes that are still in a failed state, not a historical failure log list.

`GET /api/accounts/refresh-status-list` query parameters:

- `q`
- `status=all|success|failed|never`
- `page`
- `page_size`

### Forwarding Logs and Triggers

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| GET | `/api/accounts/forwarding-logs` | Query: `limit`, `offset` | Get recent forwarding records |
| GET | `/api/accounts/forwarding-logs/failed` | Query: `limit` | Get recent failed forwarding records |
| GET | `/api/accounts/<account_id>/forwarding-logs` | Query: `limit`, `offset`, `failed_only` | Get forwarding records for one account |
| POST | `/api/accounts/trigger-forwarding-check` | None | Trigger a forwarding check immediately |
| POST | `/api/accounts/<account_id>/forwarding/reset-cursor` | JSON: `mode?`, `lookback_minutes?`, `trigger_check?` | Rewind or clear one account's forwarding cursor and optionally trigger a rescan |

`POST /api/accounts/<account_id>/forwarding/reset-cursor` request example:

```json
{
  "mode": "window",
  "lookback_minutes": 30,
  "trigger_check": true
}
```

Field meanings:

- `mode=window`: reset using a lookback window
- `mode=clear`: clear the cursor
- `lookback_minutes`: lookback in minutes; if omitted, use the system window logic
- `trigger_check`: whether to trigger one forwarding check immediately after resetting, default `true`

## Mail Endpoints

### GET `/api/emails/<email_addr>`

Internal mail list endpoint. It supports the primary email and aliases. If the email contains `+`, the full address is matched first, then the local part is progressively trimmed from right to left by `+suffix` for fallback matching.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `folder` | string | No | `inbox`, `junkemail`, `deleteditems`, `all` |
| `skip` | int | No | Pagination offset, default `0` |
| `top` | int | No | Number of results, default `20` |
| `subject_contains` | string | No | Keep only emails whose subject contains the keyword; `+` is preserved when read |
| `from_contains` | string | No | Keep only emails whose sender contains the keyword; `+` is preserved when read |
| `keyword` | string | No | Further keyword filtering across subject, preview, and body; `+` is preserved when read |

When `folder=all`, behavior matches the external API: inbox and junk mail are fetched together and merged by time.

Successful responses also include `requested_email` and `resolved_email`; when the request matches an alias, `matched_alias` is also included.

#### Item fields

Each object in `emails` contains at least the following:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Mail ID |
| `subject` | string | Subject |
| `from` | string | Sender address |
| `to` | string | Recipient address, joined with `, ` |
| `date` | string | Received time |
| `is_read` | bool | Whether it is read |
| `has_attachments` | bool | Whether attachments exist |
| `body_preview` | string | Preview text |
| `folder` | string | Folder name |

### GET `/api/email/<email_addr>/<message_id>`

Get one mail in detail. The `email` parameter can also be the primary email or an alias.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `folder` | string | No | Current folder, default `inbox` |
| `method` | string | No | Preferred detail method, usually `graph` |

#### Response fields

The `email` object includes at least:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Mail ID |
| `subject` | string | Subject |
| `from` | string | Sender |
| `to` | string | Recipients, joined with `, ` |
| `cc` | string | CC, may be empty |
| `date` | string | Received time |
| `body` | string | Mail body |
| `body_type` | string | `html` or `text` |
| `attachments` | array<object> | Attachment list |

Each object in `attachments` includes:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Attachment ID used for downloads |
| `name` | string | File name |
| `content_type` | string | MIME type |
| `size` | int | Attachment size in bytes |
| `is_inline` | bool | Whether the attachment is inline |
| `content_id` | string | Inline Content-ID, empty if absent |

### GET `/api/email/<email_addr>/<message_id>/attachments/<attachment_id>`

Download a single attachment. Returns a file stream with `Content-Disposition: attachment`.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `folder` | string | No | Current folder, default `inbox` |
| `method` | string | No | Outlook accounts prefer `graph`; if `imap` is passed, use IMAP download |

### GET `/api/email/<email_addr>/<message_id>/attachments/download-all`

Download all attachments in one ZIP file. Returns `application/zip` and names the file `attachments.zip`.

ZIP entries use the original attachment names. If multiple attachments share the same name, a numeric suffix is added automatically.

#### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `folder` | string | No | Current folder, default `inbox` |
| `method` | string | No | Outlook accounts prefer `graph`; if `imap` is passed, use IMAP download |

### POST `/api/emails/mark-read`

Bulk mark emails as read.

#### Request body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | Yes | Primary or alias email |
| `method` | string | No | Defaults to `graph`, `imap` is also allowed |
| `folder` | string | No | Default folder, default `inbox` |
| `ids` | array<string> | Conditionally required | Short form: directly pass mail IDs |
| `items` | array<object> | Conditionally required | Full form: specify folder and ID mode per mail |

In `items` mode, each item supports:

| Field | Type | Description |
| --- | --- | --- |
| `id` / `message_id` | string | Mail ID |
| `folder` | string | `inbox`, `junkemail`, `deleteditems`, `all` |
| `id_mode` | string | `graph`, `uid`, `sequence` |

#### Request examples

Short form:

```json
{
  "email": "user@outlook.com",
  "ids": ["AAMk...", "AAMk..."],
  "folder": "inbox"
}
```

Full form:

```json
{
  "email": "user@outlook.com",
  "method": "imap",
  "items": [
    {
      "id": "12345",
      "folder": "inbox",
      "id_mode": "uid"
    },
    {
      "id": "AAMk...",
      "folder": "junkemail",
      "id_mode": "graph"
    }
  ]
}
```

#### Key response fields

| Field | Description |
| --- | --- |
| `success` | `true` only if all items succeed |
| `success_count` | Number of emails marked as read successfully |
| `failed_count` | Number of failures |
| `updated_ids` | List of IDs updated successfully |
| `errors` | List of failure details |
| `error` | First failure message, for compatibility with older frontend logic |

### POST `/api/emails/delete`

Bulk delete emails.

#### Request body

```json
{
  "email": "user@outlook.com",
  "ids": ["AAMk...", "AAMk..."]
}
```

Notes:

- Outlook accounts try Graph API first, then fall back to IMAP if needed
- IMAP accounts currently do not support bulk delete

## Temporary Mailboxes

### List, Import, Domain Sources

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| GET | `/api/temp-emails` | None | Get all temporary mailboxes; each item includes `tags` |
| POST | `/api/temp-emails/import` | JSON: `account_string`, `provider` | Bulk import temporary mailboxes |
| POST | `/api/temp-emails/batch-delete` | JSON: `temp_email_ids` | Bulk delete temporary mailboxes |
| GET | `/api/duckmail/domains` | None | Get available DuckMail domains |
| GET | `/api/cloudflare/domains` | None | Get available Cloudflare domains |

Import formats for `/api/temp-emails/import`:

- `provider=gptmail`: one email per line
- `provider=duckmail`: `email----password` per line
- `provider=cloudflare`: `email----JWT` per line

### POST `/api/temp-emails/generate`

Generate a new temporary mailbox.

#### Request body

| Provider | Required fields | Description |
| --- | --- | --- |
| `gptmail` | `prefix?`, `domain?` | Uses default random generation when omitted |
| `duckmail` | `domain`, `username`, `password` | Username must be at least 3 chars, password at least 6 chars |
| `cloudflare` | `domain?`, `username?` | `username` can be empty and will be generated randomly |

#### Request example

```json
{
  "provider": "duckmail",
  "domain": "example.com",
  "username": "demo123",
  "password": "secret123"
}
```

### Temporary Mailbox Message Endpoints

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| DELETE | `/api/temp-emails/<email_addr>` | Path param `email_addr` | Delete a temporary mailbox |
| GET | `/api/temp-emails/<email_addr>/messages` | Path param `email_addr` | Get temporary mailbox messages |
| GET | `/api/temp-emails/<email_addr>/messages/<message_id>` | Path param | Get one temporary mail message |
| DELETE | `/api/temp-emails/<email_addr>/messages/<message_id>` | Path param | Currently returns "single-message deletion is temporarily disabled" |
| DELETE | `/api/temp-emails/<email_addr>/clear` | Path param | Currently returns "clear is temporarily disabled" |
| POST | `/api/temp-emails/<email_addr>/refresh` | Path param | Refresh a temporary mailbox manually |

Both `GET /messages` and `POST /refresh` return a unified `emails` list. `POST /refresh` also includes `new_count`, which is the number of newly saved messages.

## OAuth Helper Endpoints

| Method | Path | Parameters | Description |
| --- | --- | --- | --- |
| GET | `/api/oauth/auth-url` | None | Generate a Microsoft OAuth authorization link |
| POST | `/api/oauth/exchange-token` | JSON: `redirected_url` | Parse `code` from the callback URL and exchange it for a Refresh Token |

Token exchange request example:

```json
{
  "redirected_url": "http://localhost:8080/?code=..."
}
```

## Settings Endpoints

### POST `/api/settings/validate-cron`

Validate a Cron expression and return the next execution time plus the next 5 run times.

#### Request example

```json
{
  "cron_expression": "0 */6 * * *",
  "time_zone": "America/Los_Angeles"
}
```

The optional `time_zone` field previews the next run in the given IANA time zone. If omitted, the current system `app_timezone` is used.

### GET `/api/settings`

Get system settings.

In addition to the raw `settings` table values, the API also returns these common fields:

| Field | Description |
| --- | --- |
| `login_password_masked` | Masked login password |
| `external_api_key` | Current external API Key |
| `duckmail_base_url` | DuckMail API URL |
| `duckmail_api_key` | DuckMail API Key |
| `cloudflare_worker_domain` | Cloudflare Worker domain |
| `cloudflare_email_domains` | Cloudflare mailbox domain list, comma-separated |
| `cloudflare_admin_password` | Cloudflare admin password |
| `app_timezone` | Current system time zone, IANA name such as `Asia/Shanghai` |
| `show_account_created_at` | Whether to show account creation time in the mailbox list |
| `show_account_sort_order` | Whether to show custom sort order in the mailbox list |
| `forward_channels` | Enabled forwarding channels |
| `forward_check_interval_minutes` | Forwarding check interval |
| `forward_email_window_minutes` | Forwarding time window |
| `forward_include_junkemail` | Whether junk mail is included |
| `email_forward_recipient` | SMTP forwarding recipient |
| `smtp_host` | SMTP host |
| `smtp_port` | SMTP port |
| `smtp_username` | SMTP username |
| `smtp_password` | SMTP password |
| `smtp_from_email` | SMTP sender address |
| `smtp_provider` | SMTP type |
| `smtp_use_tls` | Whether TLS is enabled |
| `smtp_use_ssl` | Whether SSL is enabled |
| `telegram_bot_token` | Telegram bot token |
| `telegram_chat_id` | Telegram chat ID |

### PUT `/api/settings`

Update system settings. The main writable fields currently supported are listed below.

#### General and scheduling fields

| Field | Type | Description |
| --- | --- | --- |
| `login_password` | string | Login password, at least 8 characters |
| `gptmail_api_key` | string | GPTMail API Key |
| `refresh_interval_days` | int | Refresh interval, range `1-90` |
| `refresh_delay_seconds` | int | Delay in seconds between refreshes, range `0-60` |
| `refresh_cron` | string | Cron expression |
| `use_cron_schedule` | bool | Whether to use Cron scheduling |
| `enable_scheduled_refresh` | bool | Whether scheduled refresh is enabled |
| `app_timezone` | string | System time zone, using an IANA name such as `Asia/Shanghai` |
| `show_account_created_at` | bool | Whether to show account creation time in the mailbox list |
| `show_account_sort_order` | bool | Whether to show custom sort order in the mailbox list |
| `external_api_key` | string | External API Key; can be cleared by sending an empty string |

#### Temporary mailbox service fields

| Field | Type | Description |
| --- | --- | --- |
| `duckmail_base_url` | string | DuckMail API URL |
| `duckmail_api_key` | string | DuckMail API Key |
| `cloudflare_worker_domain` | string | Cloudflare Worker domain |
| `cloudflare_email_domains` | string | Cloudflare mailbox domains, comma-separated |
| `cloudflare_admin_password` | string | Cloudflare admin password |

#### Forwarding and SMTP / Telegram fields

| Field | Type | Description |
| --- | --- | --- |
| `forward_check_interval_minutes` | int | Polling interval, range `1-60` |
| `forward_email_window_minutes` | int | Forwarding window, range `0-10080`, where `0` means unlimited |
| `forward_include_junkemail` | bool | Whether junk mail is included in forwarding polls |
| `forward_channels` | array<string> | `smtp` / `telegram` |
| `email_forward_recipient` | string | SMTP forwarding recipient |
| `smtp_host` | string | SMTP host |
| `smtp_port` | int | SMTP port |
| `smtp_username` | string | SMTP username |
| `smtp_password` | string | SMTP password |
| `smtp_from_email` | string | SMTP sender address |
| `smtp_provider` | string | `outlook`, `qq`, `163`, `126`, `yahoo`, `aliyun`, `custom` |
| `smtp_use_tls` | bool | Whether TLS is enabled |
| `smtp_use_ssl` | bool | Whether SSL is enabled |
| `telegram_bot_token` | string | Telegram bot token |
| `telegram_chat_id` | string | Telegram chat ID |

#### Request example

```json
{
  "forward_check_interval_minutes": 5,
  "forward_email_window_minutes": 30,
  "forward_include_junkemail": true,
  "smtp_provider": "outlook",
  "forward_channels": ["smtp", "telegram"]
}
```

### POST `/api/settings/test-forward-channel`

Test a forwarding channel directly using the current frontend form configuration, without saving settings first.

#### Request examples

SMTP test:

```json
{
  "channel": "smtp",
  "config": {
    "smtp": {
      "recipient": "demo@example.com",
      "host": "smtp.office365.com",
      "port": 587,
      "username": "demo@example.com",
      "password": "secret",
      "from_email": "demo@example.com",
      "provider": "outlook",
      "use_tls": true,
      "use_ssl": false
    }
  }
}
```

Telegram test:

```json
{
  "channel": "telegram",
  "config": {
    "telegram": {
      "bot_token": "123:abc",
      "chat_id": "123456"
    }
  }
}
```

## Notes

### Proxy Usage

Mailbox-related APIs currently inherit the `proxy_url` from the account's group first:

- Graph token acquisition
- Graph mail list
- Graph mail details
- Outlook OAuth IMAP token acquisition
- Outlook OAuth IMAP list / detail / delete fallback
- Password-based IMAP list / detail
- Forwarding poll mail fetch / detail fetch

### Alias Conflict Rules

Alias saving validates that the alias:

- Cannot duplicate the account's primary email
- Cannot duplicate another account's primary email
- Cannot duplicate another account's alias
- Cannot conflict with a temporary mailbox address

### Special Response Types

These endpoints do not return ordinary JSON:

- `GET /api/accounts/refresh-all`: `text/event-stream`
- `GET /api/accounts/refresh-failed-stream`: `text/event-stream`
- `GET /api/accounts/trigger-scheduled-refresh`: `text/event-stream`
- `GET /api/groups/<group_id>/export`: `text/plain` file download
- `GET /api/accounts/export`: `text/plain` file download
- `POST /api/accounts/export-selected`: `text/plain` file download
