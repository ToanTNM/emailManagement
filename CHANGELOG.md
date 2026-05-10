# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

## [Unreleased]

## [2.0.44] - 2026-05-08

### Added
- Added server-side pagination and infinite scroll support for the mailbox list; page size now supports up to `10000`.
- Added server-side tag filtering for the mailbox list, returning pagination state fields such as `total`, `offset`, `limit`, and `has_more`.

### Changed
- Bulk import for regular mailboxes now writes in a single transaction, improving large-batch import performance and returning counts for added, skipped duplicate, and invalid rows.
- Mailbox list loading now preloads tags and aliases in batches and adds a common-account query index to reduce large-list query cost.
- Tag filtering and page-size controls are now displayed on the same row, and bulk-selection copy now refers to "loaded" accounts.

## [2.0.43] - 2026-05-08

### Added
- Token Refresh Management now supports selecting items in the current list, clearing selection, refreshing selected items, and deleting selected items in bulk.
- Added a streaming refresh task API for selected accounts: first call `POST /api/accounts/refresh-selected-stream` to initialize the task, then subscribe to SSE progress via the returned `stream_url`.

### Changed
- "Refresh selected" in Token Refresh Management no longer passes `account_ids` in the SSE GET query. It now initializes a POST task first and then subscribes to the task stream.
- The deployment docs now explicitly state that the service must run with a single worker; the official Docker image continues to use Gunicorn single-worker plus multithreading.

### Fixed
- After bulk deleting accounts, the Token Refresh Management list, the main account list, and related local caches are refreshed together so deleted accounts no longer remain visible.

## [2.0.42] - 2026-05-07

### Added
- Added a "Show Group ID" switch in system settings to control group-ID badge visibility across the group list, account summaries, and similar locations.
- When the homepage version button detects a newer repository version, it now shows an update arrow icon that shares the same click target as the version button.

### Changed
- The settings page now groups login password and external API Key under "General Settings", and moves GPTMail, DuckMail, and Cloudflare temporary mailbox settings to the bottom of the page.
- The homepage update hint changed from text to an up-arrow icon and now uses the same gold color style as the GitHub Star badge.
- The version modal now notes that only Docker builds support online updates and points users to the matching configuration section in the README.

### Fixed
- Fixed the homepage version update hint still appearing when versions matched. Added a `hidden`-state style fallback so the update icon only appears when the current version is older than the repository version.

## [2.0.41] - 2026-05-06

### Fixed
- Fixed Docker online updates failing to read container status on newer Docker daemons because the API version was too old. When the daemon explicitly returns a minimum supported version, the app now retries automatically with that version.
- Fixed Watchtower containers launched by Docker online update not inheriting the Docker API version, which caused checks and updates to fail immediately.
- Fixed ANSI-colored Watchtower log summaries from being parsed incorrectly, preventing "no update needed" results such as `Failed=0 / Updated=0` from being misreported as update failures.

## [2.0.40] - 2026-05-06

### Changed
- Docker online update status now persists to disk and keeps only the latest result; after a container self-update restart, the new process restores the most recent task state.
- Added a separate `DOCKER_UPDATE_STATUS_TIMEOUT` for status queries and container inspect calls so it no longer shares the actual update task timeout.
- The docs now explicitly explain that Docker online updates only apply to mutable image tags such as `latest`, `main`, and `dev`.

### Fixed
- Fixed Docker online update losing task state after the current container restarted; when the service comes back up, interrupted tasks are restored to a final "result unknown" state.
- Fixed the frontend polling for Docker online update ending silently when `success == null`; it now clearly warns that the service may have restarted and asks the user to refresh and verify the current version/image.

## [2.0.39] - 2026-05-06

### Added
- Added a "Download all" action in the mail attachment area, allowing multiple attachments from the same email to be downloaded as a ZIP.
- Added a Docker online update entry in the version modal, allowing container updates to be triggered from the UI when `DOCKER_UPDATE_ENABLED` is enabled.
- Added `/api/docker-update/status` and `/api/docker-update` to check Docker update capability and start login- and CSRF-protected update tasks.

### Changed
- Docker online update now runs through a one-off Watchtower container, and custom `DOCKER_UPDATE_SOCKET` values inject the corresponding `DOCKER_HOST`.
- The README moved Docker online update configuration into an optional section and added a complete `docker-compose.yml` example so the default example no longer mounts the Docker socket.

### Fixed
- Docker pull response streams are now fully read and checked for `error` / `errorDetail.message`, preventing pull failures from being mistaken as successful task start events.

## [2.0.38] - 2026-05-03

### Added
- Added WebDAV backup configuration in system settings, supporting 5-field Cron schedules with next-run calculation based on the app time zone.
- WebDAV backup now supports connection tests and manual uploads; tests upload only a temporary file, while manual uploads immediately send the real "export all groups" backup file.

### Changed
- Changing WebDAV backup settings and uploading a real backup now require login-password verification to reduce the risk of accidentally uploading sensitive export data.
- The logic for generating "export selected groups" was extracted and reused so WebDAV backups use the same all-groups file format as the export feature.

### Fixed
- Fixed the temporary mailbox list empty-state render referencing a non-existent `selectedTagIds`, which caused a frontend error after saving settings.
- Fixed save-success pages that incorrectly showed "save settings failed" when list refresh failed; the UI now clearly says settings were saved but list refresh failed.

## [2.0.37] - 2026-04-29

### Added
- Added a "Show sort order" switch in system settings to control whether custom sort values appear at the bottom of the regular mailbox list.

### Changed
- "Show sort order" now defaults to off; fresh installs and missing configs no longer show sort order by default.

### Fixed
- Added persistence, startup restore, immediate list refresh, API docs, and regression tests for the sort-order display switch.

## [2.0.36] - 2026-04-29

### Fixed
- Added a per-account forwarding interval in seconds; when multiple accounts with forwarding enabled are processed, the forwarding poll now waits between accounts to avoid pulling many accounts in quick succession.
- Added persistence and regression tests for the forwarding interval, covering settings echo and waiting behavior between multiple accounts.

## [2.0.35] - 2026-04-29

### Fixed
- Fixed cached mailbox switching still triggering auto-fetch requests. Regular account switching now only shows the current cache instead of implicitly fetching the next page when the list is displayed.
- Fixed the page baseline misalignment when deriving `Inbox / Junk Mail` views from the `All Mail` cache. Added folder-level `fetched_count / has_more / success` metadata and regression tests.

## [2.0.34] - 2026-04-28

### Added
- Added a full-refresh task log panel and a stop-task button to Token Refresh Management, so account-level progress and results can be viewed during execution.

### Changed
- Removed the "last full refresh" card from Token Refresh Management; the top summary now focuses on total mailboxes, successful mailboxes, and failed mailboxes.
- Changed the refresh confirmation dialog to an overlay so opening a full refresh no longer closes the Token Refresh Management modal.
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.

### Fixed
- Fixed Unicode output errors in the Windows console by switching scheduler, forwarding, and error logs to encoding-safe output.
- Fixed `SchedulerNotRunningError` caused by repeated `shutdown()` calls during shutdown; the `atexit` hook now reuses the idempotent `shutdown_scheduler()` and includes regression tests.
- Fixed the inability to preserve modal context during full refresh, and added stop-task API, stop-event propagation, and related regression tests.
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.

## [2.0.33] - 2026-04-28

### Added
- Added persistent custom `sort_order` for accounts, and the list can now be viewed by sort order, creation time, or mailbox name.
- Added a "Show creation time" switch in system settings, enabled by default; the mailbox list footer can show account creation time in the application time zone.
- Added a dashboard-style mailbox list to Token Refresh Management, with search by email, remark, or group, and filters for `All / Success / Failed / Never refreshed`.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Removed the "last refresh" time and sort entry from the mailbox list; when `sort_order` is unset, the default fallback is creation time.
- Refactored the desktop settings sidebar, removed the `Control Center` / save reminder card, added a pinned "General Settings" section, and moved the time zone and creation-time switches into that section.
- Removed the row numbers from both regular mailbox and temporary mailbox lists so the cards only keep primary mailbox info and status text.
- Consolidated the main token-refresh data path to `accounts + token_refresh_state`, turning the refresh-management modal into a single "snapshot + filter + mailbox list" workspace and removing separate "failed mailbox / refresh history" panels.
- Further consolidated the Token Refresh Management mailbox list into a table view with email, group, last refresh, status, and actions.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed dynamic update routes for account editing not forwarding `sort_order`, which could cause custom sort order to be lost after saving.
- Unified the `sort_order` response structure in the account list, search results, and detail APIs, and added regression tests.
- Fixed the invalid `*/60` Cron expression generated when the forwarding interval was set to `60` minutes; it now triggers on the hour and includes regression tests.
- Fixed full token refresh snapshot state incorrectly falling back to `idle` when interrupted by an exception; it now records `failed / partial_failed` correctly and updates the current account failure state.
- Fixed full token refresh being triggerable multiple times by adding backend locking and frontend conflict warnings so concurrent tasks cannot overwrite the same latest snapshot.
- Restored six-month cleanup for `account_refresh_logs` so refresh logs do not grow without bounds, and updated the refresh-related API docs.

## [2.0.32] - 2026-04-24

### Added
- Added a virtual "No tag" item to tag filtering, making it possible to filter untagged regular accounts and temporary mailboxes independently while keeping the existing OR semantics.

## [2.0.31] - 2026-04-24

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the internal mail-fetch API incorrectly updating `last_refresh_at`, so ordinary mail fetching no longer pollutes the "last refresh time" and regression tests cover the behavior.

## [2.0.30] - 2026-04-24

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed Outlook accounts not persisting the new `refresh_token` returned by Microsoft after successful manual, bulk, and scheduled refreshes, preventing later `AADSTS70000 grant is expired` errors from reusing the stale token, and added regression tests.

## [2.0.29] - 2026-04-23

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed event-order issues when closing multiple modals and fullscreen mail details by handling backdrop close in the `mousedown` phase, reducing accidental or broken closes.

## [2.0.28] - 2026-04-22

### Added
- Added application time zone selection in system settings, supporting Cron next-run previews in the saved time zone and unified logging / OAuth time display.
- The page now proactively reads `/api/settings` during initialization to restore the global time zone instead of waiting for the settings modal to open.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Scheduled refresh and mail forwarding schedulers now use `app_timezone` when building triggers; legacy installs default to `Asia/Shanghai`.
- Added a GitHub Actions workflow that merges pushes to `main` back into `dev` automatically to reduce branch drift after releases.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed an accidental time-zone update statement in the account-creation flow that could cause errors after account save success.
- Corrected the save-success message to clearly state that time display changes take effect immediately while scheduled jobs require a restart.
- Added regression coverage for startup time-zone loading, display refresh after saving a non-default time zone, and default behavior when upgrading old databases without `app_timezone`.
- Updated `docs/api.md` to document `app_timezone` and `time_zone` fields in the settings API.

## [2.0.27] - 2026-04-20

### Added
- Added unread-state display and bulk "mark as read" for the mail list, allowing multiple selected emails to be updated together in the frontend.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed occasional `The CSRF session token is missing` errors when saving settings or importing accounts in Docker deployments. The app now fetches a non-cacheable CSRF token from the current login session and automatically retries once on CSRF mismatch in the frontend.
- Fixed Gmail in `IMAP (Generic)` mode showing all messages as unread because segmented `FETCH` responses were parsed incorrectly. The parser now reads the full IMAP `FLAGS` and `INTERNALDATE` values.

## [2.0.26] - 2026-04-19

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the desktop mail list not loading the next page after scrolling to the end. Pagination offset calculation and auto-load checks after list rerender were improved.

## [2.0.25] - 2026-04-19

### Added
- Added tags to the temporary mailbox list, including display, filtering by tag, and bulk add/remove within the temporary mailbox group.
- Added a temporary mailbox bulk delete API and frontend selection actions so temporary mailboxes can be cleaned up with the same bulk toolbar.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the tag system only supporting regular accounts in temporary mailbox scenarios. Database associations, API responses, and frontend search links for temporary mailboxes were added.
- Added backend regression tests for temporary mailbox tag APIs, covering tag display and bulk add/remove flows.

## [2.0.24] - 2026-04-19

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed group order being lost after app restart, ensuring drag-and-drop group order is stored reliably and adding backend regression tests.
- Fixed the sample text line breaks in the account import dialog so the example format no longer collapses into one line and affects bulk-import detection.
- Fixed the desktop settings page where the "By days" / "Cron expression" tabs could cover the "System Settings" title while scrolling down. The content area now scrolls independently and the sidebar sync logic was adjusted accordingly.

## [2.0.23] - 2026-04-19

### Added
- Added version information in the top navigation, with support for viewing the current version, copying the version number, and jumping to the changelog.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Adjusted the navigation brand area so version info and the GitHub entry are presented as a more unified product-metadata section.
- Redesigned the GitHub Star button into a capsule-style button that fits the current console-like style better, with hover, active, and focus feedback.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed top-version info not responding in some browsers by switching to a more stable global trigger.

## [2.0.22] - 2026-04-17

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the dynamically overridden `PUT /api/accounts/<id>`, `GET /api/emails/<email>`, and `GET /api/external/emails` losing their auth decorators, preventing access-control bypass when not logged in or when no API key was provided.
- Added startup-time protection assertions for dynamic route overrides; if a critical endpoint is replaced by an unwrapped function, the app now fails at startup instead of silently losing auth again.
- Added regression tests for the external mail API, internal mail API, account update API, and the dynamic endpoint protection marker, covering actual 401 behavior and route registration state.

## [2.0.21] - 2026-04-17

### Added
- Added attachment list display and download support to mail details so Graph and IMAP mailboxes can directly view and download attachments.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed plain-text IMAP mail details being incorrectly concatenated into literal `<br>` content; plain text is now returned correctly.

## [2.0.20] - 2026-04-16

### Added
- Added a bulk "copy email + aliases" action in the left mailbox list, allowing the primary email and all aliases of selected accounts to be copied at once and deduplicated automatically.

## [2.0.19] - 2026-04-15

### Added
- Added a built-in `2925 Mail` type, using `imap.2925.com:993` by default, and added domain auto-detection plus frontend import/edit dropdown entries.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed some custom IMAP / 2925 IMAP servers returning broken `SEARCH` / `UID SEARCH` results, which could leave inboxes empty even when mail existed.
- Added multi-level fallback for IMAP list and detail queries: `UID SEARCH -> SEARCH -> direct FETCH by EXISTS count`, improving compatibility with non-standard servers.

## [2.0.18] - 2026-04-15

### Added
- Added a runtime backend project model that manages the independent status of a mailbox inside a project by `project_key`, with full APIs for starting projects, listing projects, listing project accounts, claim, success, failure, release, reset-failed, remove, and restore.
- Added backend regression tests for the project runtime, covering project start, scope completion, manual reset after failure, and re-importing the same email after deletion while preserving old project state.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Collapsed the "create project + scope completion" idea into a single "start project" semantic; restarting the same project now only adds new mailboxes and does not reset existing state.
- Project mailbox identity is now tracked by email address rather than pure `account_id`, preventing a deleted-and-reimported mailbox from bypassing existing `done` / `failed` state.

### Documentation
- Added project-management API docs in `docs/api.md`, covering status definitions, the start-project semantic, query parameters, request/response examples, and the `deleted` and re-import reuse rules.

## [2.0.17] - 2026-04-15

### Added
- Added a WeCom group-bot Webhook forwarding channel that only needs a Webhook URL and can be used as an independent forwarding channel.
- Added settings persistence, test sending, and basic regression tests for WeCom forwarding.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Changed the release flow so pushing a `vX.Y.Z` version tag automatically triggers the GitHub Release workflow, with manual triggering kept only as a fallback.
- Adjusted Docker build parameters to disable provenance / SBOM attestation so GHCR release pages no longer show extra `unknown/unknown` platform entries.

## [2.0.16] - 2026-04-15

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Refactored the desktop settings page into a wider two-column layout and added a left-side quick navigation for primary settings modules.
- Added click-to-jump and scroll-linked highlight behavior to the settings navigation to reduce back-and-forth searching in long forms.
- Compressed the "Mail Forwarding Settings" section into a more console-like compact layout, organizing poll parameters, action buttons, and channel config into a high-density desktop panel.

### Added
- Added module-level quick-jump entries to the left-side "Current Includes" area of the desktop settings page, allowing direct jumps to Access, DuckMail, Cloudflare, refresh strategy, and mail forwarding.
- Added drawer-style panels for "Recent forwarding history" and "Recent forwarding failures", collapsed by default so the log lists can be expanded on demand and the default page height stays shorter.

## [2.0.15] - 2026-04-15

### Documentation
- Added a Chinese release guide covering version rules, the standard release flow, GitHub Actions behavior, and the post-release checklist.
- Added an upgrade guide covering upgrade, rollback, and notes for Docker, Windows `exe`, and direct Python runs.
- Adjusted the image tag notes and release-flow descriptions in `README.md` and the deployment docs so they match the current workflow.

## [2.0.14] - 2026-04-14

### Added
- Added progressive `+suffix` fallback matching for mailbox and alias lookups so internal and external mail APIs can resolve addresses such as `user+work@gmail.com` back to the managed primary mailbox or alias.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed aggregated `folder=all` ordering for IMAP/Gmail mailboxes by normalizing RFC822 timestamps that include trailing timezone labels such as `(UTC)`.
- Fixed IMAP all-mail merging to prefer the server-reported `INTERNALDATE` when available so merged results are sorted by received time instead of unreliable header `Date`.
- Fixed the mobile mail list layout so very long sender addresses no longer push the card outside the viewport, and folder badges now wrap to a new line on narrow screens.

## [2.0.11] - 2026-04-14

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the manual GitHub release workflow packaging path so Windows release assets and Docker release publication no longer fail during the release run.

## [2.0.10] - 2026-04-13

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Changed `folder=all` mailbox aggregation to fetch `inbox` and `junkemail` in parallel before merging and sorting the result list.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the aggregated mail path failing to pass group proxy failover settings consistently to both `inbox` and `junkemail` fetches.
- Fixed the external `/api/external/emails` compatibility-check coverage so `folder=all` remains accepted without changing the live API request or response contract.

## [2.0.9] - 2026-04-13

### Added
- Added an "All Mail" option to the top of the mail list, placed before "Inbox".

### Changed
- After selecting a mailbox account, the default view is now the "All Mail" list.
- The loading and empty-state text in the mail list now reflect the current folder name.

### Fixed
- Fixed the "All Mail" list not distinguishing whether a message came from Inbox or Junk Mail; the source badge is now shown.
- Fixed opening mail details from "All Mail" still using an `all` request, which could load the wrong folder; details now load using the email's actual source folder.

## [2.0.8] - 2026-04-12

### Added
- Added per-group proxy failover settings with `primary proxy -> fallback proxy 1 -> fallback proxy 2` order for Outlook Graph/token requests.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Moved proxy failover configuration from global settings into each mailbox group so different groups can use different fallback chains.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed Outlook token refresh and Graph requests failing immediately when the primary group proxy was unreachable by retrying through the configured fallback proxies in order.
- Fixed the group settings dialog copy so `fallback proxy 1` and `fallback proxy 2` both document support for `direct` as an explicit direct-connect fallback.

## [2.0.7] - 2026-04-11

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Replaced the custom Windows tray implementation with a `pystray`-based tray menu and generated application icon.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the packaged Windows desktop app tray menu labels and icon rendering.
- Removed the brittle dependency on low-level Win32 `ctypes` tray bindings that caused repeated Windows-specific startup failures.

## [2.0.6] - 2026-04-11

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed additional Windows tray startup crashes by replacing more `ctypes.wintypes` handle annotations with compatibility-safe Win32 handle definitions.

## [2.0.5] - 2026-04-11

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the Windows tray bootstrap using unavailable `ctypes.wintypes` symbols (`LRESULT`, `WNDPROC`) that caused the packaged app to crash during startup.

## [2.0.4] - 2026-04-11

### Added
- Added a Windows system tray controller for the packaged desktop app with `Open UI` and `Exit` actions.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Switched the packaged Windows desktop runtime to a controllable background server so the tray can exit the app cleanly.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed the packaged Windows app having no visible way to quit after launching the browser UI.

## [2.0.3] - 2026-04-11

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed Windows `exe` packaging to include Python modules imported from dynamically executed segmented files, preventing startup crashes such as `ModuleNotFoundError: No module named 'imaplib'`.
- Made the PyInstaller hidden-import list derive automatically from the segmented source files so future segment imports are included in packaged builds.

## [2.0.2] - 2026-04-11

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Switched the packaged desktop build to GUI mode and auto-open the local web UI in the browser on startup.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed packaged startup diagnostics so desktop launch failures are written to `startup-error.log` and surfaced to Windows users with a dialog instead of silently exiting.
- Fixed the packaged desktop default bind host to use `127.0.0.1`, avoiding local browser access issues on some Windows machines.

## [2.0.1] - 2026-04-11

### Added
- Added automated Windows `exe` packaging in the tag-based GitHub Release workflow.
- Added a PyInstaller spec and packaged-runtime resource handling for the desktop build.

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Documented the Windows desktop distribution flow in the README, deployment guide, and release guide.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed packaged execution so templates, static assets, database storage, and `SECRET_KEY` persistence work correctly after bundling.

## [2.0.0] - 2026-04-09

### Changed
- Removed the running-progress card from Token Refresh Management and unified ongoing logs inside the modal.
- Formalized the repository into a release-managed project with `main` / `dev` branch roles, semantic versioning, and a documented release flow.
- Added automated GitHub Release generation and clarified collaboration / branch-protection guidance for future contributors.
- Tightened Docker image publishing policy so documentation-only changes no longer trigger image builds.

### Added
- Added `VERSION`, `CHANGELOG.md`, `RELEASE.md`, and `BRANCH_PROTECTION.md` to make versioning, release, and collaboration rules explicit.
- Added a release-tag-driven image/version workflow for `latest`, `dev`, and semantic version tags.

### Fixed
- Fixed "retry failed" still using synchronous requests by converting it to streamed logging and reusing the refresh interval and stop-task controls.
- Fixed invalid Docker image tag generation caused by `docker/metadata-action` in tag-triggered builds.

## [1.0.0] - 2026-04-07

### Added
- Stable initial release baseline for the Outlook mail management tool.
- Web UI for mailbox group management, mailbox import, and mail browsing.
- Outlook access via Microsoft Graph API, new IMAP, and legacy IMAP fallback.
- Temporary mailbox integration for GPTMail, DuckMail, and Cloudflare Temp Email.
- External API access using API Key authentication.
- Docker and Docker Compose deployment support.
