# Project Key + Account Status Design

## 1. Background

The current `project_key` is more like a lightweight anti-duplication parameter at claim time, not a full project model. The new goal is to define a "project" as a reusable business entity and maintain a separate status for each `mailbox + project` pair.

The core requirements are:

- The same mailbox can participate in multiple different projects.
- Once a mailbox has been successfully consumed in a project, it will not be assigned again in that same project.
- If a mailbox fails in a project, it enters `failed` and is not automatically assigned again by default. Manual intervention is required before it can be assigned again.
- A project can be created without a group scope, in which case it applies to all mailboxes.
- A project can be reused multiple times. Each time it is used, new mailboxes within the defined scope are added.
- Do not depend on the tag system. The frontend and APIs should query project-related tables directly.

## 2. Target Semantics

Maintain an independent status record for every `account_id + project_key` pair.

Example:

- Mailbox `a@example.com` in project `gpt`:
  - Initial status is `toClaim`
  - After successful registration, the status becomes `done`
  - When `gpt` is claimed again later, this mailbox will not be assigned again

- The same mailbox `a@example.com` in project `google`:
  - Initial status is also `toClaim`
  - This registration fails, so the status becomes `failed`
  - It will not be claimed again automatically
  - Only after a manual reset back to `toClaim` will it participate in assignment again

Conclusion:

- Whether a mailbox can still be assigned is determined by project, not globally.
- The same mailbox in different projects does not affect each other.

## 3. Status Definitions

Keep only the minimum necessary statuses.

### 3.1 Project Account Status

- `toClaim`
  - The mailbox is available to be claimed in this project

- `claiming`
  - The mailbox is currently being claimed by some caller

- `done`
  - The mailbox has already been successfully consumed in this project
  - It will not be assigned to this project again

- `failed`
  - The mailbox failed during its most recent consumption attempt in this project
  - It will not automatically re-enter the assignment pool
  - It must be manually reset before it can be claimed again

- `removed`
  - The mailbox was manually removed from the project scope
  - It will no longer participate in assignment for this project

- `deleted`
  - The mailbox used to exist in the project, but the account has been deleted from the system master table
  - Used to preserve project history and prevent automatic reassignment
  - If the mailbox is re-imported into the system, startup logic can decide whether to restore the association

### 3.2 Status Transitions

- `toClaim -> claiming`
  - Claim request succeeds

- `claiming -> done`
  - Completion success is reported

- `claiming -> failed`
  - Completion failure is reported

- `claiming -> toClaim`
  - Release request is called
  - Claim lease expires and is recycled

- `failed -> toClaim`
  - Manual reset of a failed mailbox

- `toClaim -> removed`
  - Manual removal from the project

- `removed -> toClaim`
  - Manual restoration to the project

- `* -> deleted`
  - During project startup, the corresponding account is found missing from the system master table

- `deleted -> toClaim`
  - When the same email address is re-imported into the system, startup restores it as claimable

- `deleted -> failed`
  - When the same email address is re-imported into the system, startup restores its historical failed state

- `deleted -> done`
  - When the same email address is re-imported into the system, startup restores its historical successful state

Notes:

- `failed` is an explicit failure state.
- `failed` is not part of the automatic claimable set by default.
- `failed` and `removed` both require manual intervention, but their meanings differ:
  - `failed`: the mailbox is still within the project scope, but the attempt failed and a human must decide whether to retry
  - `removed`: the mailbox was explicitly removed from the project scope
- `deleted` is a system deletion state:
  - It is not a manual action
  - It is not "removed from scope"
  - It means the project used to know this mailbox, but the account has been deleted from the system master table

## 4. Data Model

Add four new tables.

## 4.1 `projects`

Project definition table.

Suggested fields:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `name TEXT NOT NULL`
- `project_key TEXT NOT NULL UNIQUE`
- `description TEXT DEFAULT ''`
- `scope_mode TEXT NOT NULL DEFAULT 'all'`
- `status TEXT NOT NULL DEFAULT 'active'`
- `last_scope_synced_at TEXT`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

Notes:

- `project_key` is the stable project identifier, for example `gpt` or `google`
- `scope_mode`
  - `all`: the project applies to all mailboxes
  - `groups`: the project applies only to mailboxes in the selected groups
- `status`
  - `active`
  - `paused`
  - `archived`

## 4.2 `project_group_scopes`

Project group scope table.

Suggested fields:

- `project_id INTEGER NOT NULL`
- `group_id INTEGER NOT NULL`
- `created_at TEXT NOT NULL`

Constraint:

- `PRIMARY KEY (project_id, group_id)`

Notes:

- When `scope_mode = all`, this table can be empty.
- When `scope_mode = groups`, this table defines the scoped groups.

## 4.3 `project_accounts`

The project-mailbox status relation table. This is the core of the design.

Suggested fields:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `project_id INTEGER NOT NULL`
- `account_id INTEGER`
- `normalized_email TEXT NOT NULL`
- `email_snapshot TEXT NOT NULL`
- `status TEXT NOT NULL DEFAULT 'toClaim'`
- `source_group_id INTEGER`
- `caller_id TEXT DEFAULT ''`
- `task_id TEXT DEFAULT ''`
- `claim_token TEXT`
- `claimed_at TEXT`
- `lease_expires_at TEXT`
- `last_result TEXT DEFAULT ''`
- `last_result_detail TEXT DEFAULT ''`
- `claim_count INTEGER NOT NULL DEFAULT 0`
- `first_claimed_at TEXT`
- `last_claimed_at TEXT`
- `done_at TEXT`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

Constraint:

- `UNIQUE(project_id, normalized_email)`

Suggested indexes:

- `INDEX(project_id, status)`
- `INDEX(project_id, lease_expires_at)`
- `INDEX(account_id)`
- `INDEX(project_id, normalized_email)`

Semantics:

- Each mailbox has only one record in each project
- The primary identity of a mailbox in a project is `normalized_email`, not `account_id`
- `status=done` means the mailbox has already been successfully consumed for that project
- `status=toClaim` means the mailbox is still available to claim for that project
- `status=failed` means the mailbox failed in that project and must be manually reset before it can be claimed again
- `status=deleted` means the mailbox once belonged to the project, but the account no longer exists in the system master table

## 4.4 `project_account_events`

Project account event table for troubleshooting and auditing.

Suggested fields:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `project_id INTEGER NOT NULL`
- `account_id INTEGER NOT NULL`
- `normalized_email TEXT NOT NULL`
- `project_account_id INTEGER`
- `action TEXT NOT NULL`
- `from_status TEXT`
- `to_status TEXT`
- `caller_id TEXT DEFAULT ''`
- `task_id TEXT DEFAULT ''`
- `claim_token TEXT`
- `detail TEXT DEFAULT ''`
- `created_at TEXT NOT NULL`

Recommended actions to record:

- `sync_add`
- `claim`
- `complete_success`
- `complete_failed`
- `release`

## 5. Scope Rules

## 5.1 Project Without Groups

If `group_ids` is not provided when creating a project:

- `scope_mode = all`
- The project applies to all available mailboxes

When the project scope is synchronized later:

- Scan all accounts
- For any mailbox that does not yet exist in the project, insert a `project_accounts` row with `status='toClaim'` based on `normalized_email`

## 5.2 Project With Groups

If `group_ids` is provided when creating a project:

- `scope_mode = groups`
- The project applies only to mailboxes in those groups

When the project scope is synchronized later:

- Scan only the accounts in those groups
- For any new mailbox that has never entered the project, insert a `project_accounts` row with `status='toClaim'` based on `normalized_email`

## 5.3 Scope Synchronization Is Incremental, Not Destructive

The recommended sync rule is:

- Only add missing `project_accounts`
- Do not automatically delete existing `project_accounts`

Reason:

- Historical `done` records should not disappear just because the mailbox later changed groups
- Failed mailboxes, like successful ones, should not be wiped out when scope changes
- If the same mailbox is deleted and then re-imported, the same project record must be reused instead of creating a brand-new one due to an `account_id` change

If removal is needed, use the explicit "remove account from project" API.

## 6. Definition of a Reusable Project

A project is not a one-time task. It is a long-lived reusable business container.

Using the `gpt` project as an example:

1. Before the first use, synchronize the scope
2. All existing mailboxes are inserted into `project_accounts`
3. Mailboxes that succeed become `done`
4. Mailboxes that fail become `failed`
5. Some time later, a new batch of mailboxes is added
6. Before the second use, synchronize the scope again
7. Only the newly added mailboxes are inserted, and they are initialized as `toClaim`
8. Existing `done` mailboxes remain `done`
9. Existing `toClaim` mailboxes remain claimable, while `failed` mailboxes stay pending manual handling

This satisfies the following:

- The project can be used multiple times
- Each use can add new mailboxes
- Mailboxes that have already been successfully consumed will not be assigned again in the same project

## 7. Core API Design

## 7.1 Start Project

`POST /api/projects/start`

Request example:

```json
{
  "name": "GPT Registration",
  "project_key": "gpt",
  "description": "GPT registration project",
  "group_ids": [1, 2]
}
```

If no groups are specified:

```json
{
  "name": "Google Registration",
  "project_key": "google",
  "description": "Google registration project"
}
```

Behavior:

- If `project_key` does not exist:
  - Create `projects`
  - If `group_ids` is provided, write `project_group_scopes`
  - Immediately run a scope sync
- If `project_key` already exists:
  - Treat it as "starting the same project again"
  - By default, reuse the existing saved scope configuration
  - If `group_ids` is explicitly provided in the request, update the scope first and then sync
  - Only add new mailboxes; do not change existing mailbox statuses
- During startup, scan historical project records first:
  - Any associated accounts that no longer exist in the system master table are marked as `deleted`
- Then scan the system accounts in the current scope:
  - Match historical project records by `normalized_email`
  - If this is the first time the email appears, insert a new `project_accounts` row
  - If the record already exists historically but `account_id` has changed, reuse the old record and update the new `account_id`
- Set the project status to `active`

Return:

- Basic project information
- Number of added accounts
- Whether this was the first creation
- Number of accounts added in this run
- Number of accounts marked as `deleted`

Response example:

```json
{
  "success": true,
  "data": {
    "project_key": "gpt",
    "created": true,
    "added_count": 128,
    "deleted_count": 3,
    "total_count": 560
  }
}
```

Notes:

- It is recommended to call this before each project use
- The same API handles both "first project creation" and "scope sync for new mailboxes"
- The frontend button label should be "Start Project" or "Start Project Again" rather than exposing `sync-scope` directly

## 7.2 Claim a Project Mailbox

`POST /api/projects/{project_key}/claim-random`

Request example:

```json
{
  "caller_id": "reg-worker-001",
  "task_id": "task-20260415-0001",
  "lease_seconds": 600
}
```

Behavior:

1. Verify that the project exists and `status=active`
2. Pick an account from `project_accounts` where `status='toClaim'`
3. Also require the global `accounts.pool_status='available'`
4. Inside a transaction, update:
   - `accounts.pool_status='claimed'`
   - `project_accounts.status='claiming'`
   - write `claim_token / caller_id / task_id / claimed_at / lease_expires_at`
   - increment `claim_count`
5. Write the event log

Return:

- `project_key`
- `account_id`
- `email`
- `claim_token`
- `claimed_at`
- `lease_expires_at`

## 7.3 Mark Success

`POST /api/projects/{project_key}/complete-success`

Request example:

```json
{
  "account_id": 123,
  "claim_token": "clm_xxx",
  "caller_id": "reg-worker-001",
  "task_id": "task-20260415-0001",
  "detail": "Registration succeeded"
}
```

Behavior:

- Verify `project_accounts.status='claiming'`
- Change `project_accounts.status` to `done`
- Write `done_at`
- Record `last_result='success'`
- Update the global `accounts.pool_status` according to the existing post-consumption rule
- Write the event log

Result:

- The same mailbox will no longer enter the claimable set for this project

## 7.4 Mark Failure

`POST /api/projects/{project_key}/complete-failed`

Request example:

```json
{
  "account_id": 123,
  "claim_token": "clm_xxx",
  "caller_id": "reg-worker-001",
  "task_id": "task-20260415-0001",
  "detail": "Registration failed"
}
```

Behavior:

- Verify `project_accounts.status='claiming'`
- Change `project_accounts.status` to `failed`
- Clear the current claim-state fields
- Record `last_result='failed'`
- Restore the global `accounts.pool_status` to `available` or handle it according to the existing failure policy
- Write the event log

Result:

- The same mailbox will not be claimed again automatically in this project
- It must be manually reset before it can re-enter the claimable set

## 7.5 Explicit Release

`POST /api/projects/{project_key}/release`

Behavior is similar to marking failure:

- `claiming -> toClaim`
- Used for task cancellation, worker interruption, or manual abandonment

## 7.6 Manually Reset a Failed Mailbox

`POST /api/projects/{project_key}/reset-failed`

Request example:

```json
{
  "account_id": 123,
  "detail": "Manual retry allowed"
}
```

Behavior:

- Verify `project_accounts.status='failed'`
- Change the status back to `toClaim`
- Keep the historical `last_result='failed'`
- Write the event log

Result:

- The mailbox re-enters the project's claimable set

## 7.7 Manually Remove From the Project Scope

`POST /api/projects/{project_key}/remove-account`

Request example:

```json
{
  "account_id": 123,
  "detail": "Removed from project manually"
}
```

Behavior:

- Verify that the project account exists
- If the current status is `claiming`, reject the removal and require a release first
- Change `project_accounts.status` to `removed`
- Clear the current claim-state fields
- Write the event log

Result:

- The mailbox no longer participates in assignment for this project

## 7.8 Restore to the Project Scope

`POST /api/projects/{project_key}/restore-account`

Request example:

```json
{
  "account_id": 123,
  "detail": "Restored to the project manually"
}
```

Behavior:

- Verify `project_accounts.status='removed'`
- Change the status back to `toClaim`
- Write the event log

Result:

- The mailbox re-enters the project's claimable set

## 7.9 Lease Expiry Recycling

Background scheduled task:

- Scan `project_accounts.status='claiming' AND lease_expires_at < now`
- Change them back to `toClaim`
- Restore `accounts.pool_status` accordingly
- Write an `expire_recycle` event

## 7.10 Project Detail / Project Account List

`GET /api/projects`

Return aggregated counts for each project:

- `total_count`
- `to_claim_count`
- `claiming_count`
- `failed_count`
- `done_count`
- `removed_count`

`GET /api/projects/{project_key}/accounts`

Supports filtering by:

- `status`
- `group_id`
- `provider`
- `keyword`

This becomes the primary query interface for the frontend project page.

## 8. Transactions and Concurrency

`claim-random` must use a database transaction to ensure atomicity.

Recommended flow:

1. `BEGIN IMMEDIATE`
2. Find a project account that satisfies all conditions:
   - `project_accounts.status = 'toClaim'`
   - `accounts.pool_status = 'available'`
   - `accounts.status = 'active'`
3. Update the global `accounts` table
4. Update the `project_accounts` table
5. Write the event log
6. `COMMIT`

This guarantees:

- The same mailbox cannot be claimed by two workers at the same time
- Mailboxes are logically independent across projects, but physically only one task can occupy the same mailbox at any given moment

## 9. Why This Is Not Tied to Tags

This design explicitly does not depend on tags for the following reasons:

- Tags are better for classification than for hard business state
- Tags can easily lead to conflicting states
- Tag renaming is too tightly coupled to project renaming
- Strict atomic control is harder with tags during concurrent claims
- The frontend project page can query `projects + project_accounts` directly

Therefore:

- Project state exists only in `project_accounts.status`
- Project definitions exist only in `projects.project_key`
- The frontend and APIs query project tables only, not tags

## 10. Relationship to the Old `project_key` Logic

The old logic was closer to:

- External requests directly passed a `project_key`
- The system only tracked which accounts had already been used by a given caller + project
- It mainly solved duplicate claims within the same project

The new logic is:

- Start the project first; the first start automatically creates the project definition
- Each mailbox maintains an explicit status under each project
- Once successful, it is no longer assigned; if it fails, it becomes `failed`
- Supports project lists, project details, project reuse, and incremental scope sync

Recommended compatibility strategy:

- Keep the old API for a period of time
- Move new business flows to the project APIs
- Decide later whether to deprecate the old direct `project_key` mode

## 11. Example SQL Draft

### 11.1 Create `projects`

```sql
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    project_key TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    scope_mode TEXT NOT NULL DEFAULT 'all',
    status TEXT NOT NULL DEFAULT 'active',
    last_scope_synced_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### 11.2 Create `project_group_scopes`

```sql
CREATE TABLE IF NOT EXISTS project_group_scopes (
    project_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (project_id, group_id)
);
```

### 11.3 Create `project_accounts`

```sql
CREATE TABLE IF NOT EXISTS project_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    account_id INTEGER,
    normalized_email TEXT NOT NULL,
    email_snapshot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'toClaim',
    source_group_id INTEGER,
    caller_id TEXT DEFAULT '',
    task_id TEXT DEFAULT '',
    claim_token TEXT,
    claimed_at TEXT,
    lease_expires_at TEXT,
    last_result TEXT DEFAULT '',
    last_result_detail TEXT DEFAULT '',
    claim_count INTEGER NOT NULL DEFAULT 0,
    first_claimed_at TEXT,
    last_claimed_at TEXT,
    done_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(project_id, normalized_email)
);
```

### 11.4 Create `project_account_events`

```sql
CREATE TABLE IF NOT EXISTS project_account_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    normalized_email TEXT NOT NULL,
    project_account_id INTEGER,
    action TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    caller_id TEXT DEFAULT '',
    task_id TEXT DEFAULT '',
    claim_token TEXT,
    detail TEXT DEFAULT '',
    created_at TEXT NOT NULL
);
```

## 12. Recommended Implementation Order

First phase:

- Create tables
- Implement the start project API
- Implement project list / project detail / project account list APIs

Second phase:

- Implement the project claim API
- Implement success / failure / release APIs
- Implement the lease expiry recycling job

Third phase:

- Build the frontend project management page
- Add the project statistics panel
- Decide on compatibility or migration for the old direct `project_key` mode

## 13. Final Conclusion

This design meets your latest requirements:

- Not tied to tags
- Each mailbox has an independent status under each project
- A mailbox that succeeds in the same project will not be assigned again
- A mailbox that fails in the same project enters `failed` and must be manually reset before it can be assigned again
- If the same mailbox is deleted and then re-imported, the original project state is reused based on the email address
- If no groups are specified, the project can apply to all mailboxes
- The project can be reused repeatedly
- New mailboxes can be added before each use by running scope synchronization

If implementation starts later, the core should center on `project_accounts` rather than continuing to expand the lightweight `project_key` deduplication table.
