# Multi-Mailbox Email Management Tool

A mail management tool for multi-mailbox scenarios. It supports Outlook/Hotmail OAuth, Microsoft Graph API, and standard IMAP for unified mail reading, management, and forwarding. It also provides a web UI for group management, account management, mail viewing, and external API access. Current support includes Outlook/Hotmail, Gmail, QQ, 163, 126, Yahoo, Aliyun Mail, and custom IMAP accounts, plus temporary mailbox support through GPTMail, DuckMail, and Cloudflare Temp Email.

## 📦 Quick Start

### Live Demo Site (may not be the latest version)

https://aso.de5.net

admin123

Note: Do not change the password or store real data on the demo site. It runs on a non-persistent service, so data may be lost and reset at any time.

## 🌿 Versioning and Releases

This project uses a lightweight two-branch release model:

- `main`: stable branch; only releasable code stays here
- `dev`: development branch; daily feature work and fixes happen here by default

Standard release flow:

1. Finish development and validation on `dev`
2. Merge into `main`
3. Update `VERSION` and `CHANGELOG.md`
4. Push `main`
5. Manually trigger the GitHub Actions `Create GitHub Release` workflow and pass the version number without `v`, for example `2.0.15`

The manual release workflow automatically:

- Builds the Windows `exe` and packages it as a Release asset
- Creates and pushes the matching tag, such as `v2.0.15`
- Generates the GitHub Release body from the matching entry in `CHANGELOG.md`
- Builds and publishes the release image `ghcr.io/assast/outlookemail:v2.0.15`

Docker image tag conventions:

- `ghcr.io/assast/outlookemail:latest`: most recent eligible stable build from the default branch
- `ghcr.io/assast/outlookemail:main`: most recent eligible build from `main`
- `ghcr.io/assast/outlookemail:dev`: most recent eligible build from `dev`
- `ghcr.io/assast/outlookemail:vX.Y.Z`: official release image

See the full release steps, workflow behavior, and checklist in [Release Guide](RELEASE.md).

### Option 1: Download the Windows `exe` (Windows only)

Download the matching `OutlookEmail-windows-x64-*.zip` from GitHub Releases, extract it, and run `OutlookEmail.exe` directly.

On first launch, the desktop app automatically:

- Generates and persists `SECRET_KEY`
- Creates the local data directory and SQLite database
- Starts the web service at `http://127.0.0.1:5000`

Notes:

- On Windows, data is stored in `%APPDATA%\OutlookEmail`
- The default login password is still `admin123`; change it immediately after first login

### Option 2: Use Docker (recommended for servers)

```bash
# Pull the latest image
docker pull ghcr.io/assast/outlookemail:latest

# Run the container
docker run -d \
  --name outlook-mail-reader \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -e LOGIN_PASSWORD=admin123 \
  -e SECRET_KEY=your-secret-key-here \
  ghcr.io/assast/outlookemail:latest
```

### Option 3: Run directly with Python

```bash
git clone https://github.com/assast/outlookEmail.git
cd outlookEmail
pip install -r requirements.txt
export SECRET_KEY=your-secret-key-here
python web_outlook_app.py
```

Open `http://localhost:5000` to use the app.
For server deployments, set a fixed `SECRET_KEY` explicitly.

### Runtime Mode

The service must run with a single worker. The official Docker image uses Gunicorn with one worker and multiple threads; if you customize the deployment, do not increase the worker count. The stream-based token refresh tasks use short-lived in-process state, so multiple workers can cause task initialization and SSE subscription to land in different processes.

### Using Docker Compose

```yaml
version: '3.8'
services:
  outlook-mail-reader:
    image: ghcr.io/assast/outlookemail:latest
    container_name: outlook-mail-reader
    ports:
      - "5000:5000"
    volumes:
      - ./data:/app/data
    environment:
      - LOGIN_PASSWORD=admin123
      - SECRET_KEY=your-secret-key-here
      - FLASK_ENV=production
    restart: unless-stopped
```

```bash
docker-compose up -d
```

#### Optional: Enable in-app Docker online updates

Docker online updates in the UI require access to the host Docker socket. `/var/run/docker.sock` grants host-level Docker control, so only enable it in trusted environments.

This feature is only for mutable image tags such as `latest`, `main`, and `dev`. If the current container uses a fixed tag like `v2.0.39`, the UI will refuse to update online because Watchtower cannot automatically switch a fixed tag to a newer release tag.

The app automatically retries with the minimum API version reported by the daemon. If your Docker environment or socket proxy has special compatibility requirements, you can set `DOCKER_UPDATE_API_VERSION` explicitly; the value can be taken from `docker version --format '{{.Server.APIVersion}}'`.

The optional `DOCKER_UPDATE_STATUS_TIMEOUT` controls only status queries and container inspect timeouts in seconds. It does not affect the actual update task timeout `DOCKER_UPDATE_TIMEOUT`.

If there is no newer image available for the current `latest` / `main` / `dev` tag, the UI will show that no update was applied instead of reporting a failure.

```yaml
version: '3.8'
services:
  outlook-mail-reader:
    image: ghcr.io/assast/outlookemail:latest
    container_name: outlook-mail-reader
    ports:
      - "5000:5000"
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - LOGIN_PASSWORD=admin123
      - SECRET_KEY=your-secret-key-here
      - FLASK_ENV=production
      - DOCKER_UPDATE_ENABLED=true
      - DOCKER_UPDATE_CONTAINER=outlook-mail-reader
      # Optional: explicitly specify the API version in newer Docker daemon / socket proxy environments
      # - DOCKER_UPDATE_API_VERSION=1.52
    restart: unless-stopped
```

## ✨ Features

### Mail Reading Modes

This tool currently has three read paths:

1. **Outlook/Hotmail OAuth + Graph API** - preferred for Outlook / Hotmail / Live accounts
2. **Outlook/Hotmail OAuth + IMAP fallback** - `outlook.live.com` / `outlook.office365.com`
3. **Standard IMAP** - for Gmail, QQ, 163, 126, Yahoo, Aliyun Mail, and custom IMAP

### Web App Features

#### Core
- 🔐 **Login protection** - password-protected web UI with online password changes
- 📁 **Group management** - create, edit, and delete mailbox groups; custom group colors; group-level proxy settings
- 🌐 **Group proxies** - HTTP/SOCKS5 proxy per group
- 📧 **Multi-mailbox management** - bulk import and manage Outlook/Hotmail OAuth / IMAP accounts
- 🪪 **Alias management** - assign multiple alias addresses to one mailbox; both primary and alias emails can be used for search and external API calls
- 🔀 **Advanced alias usage** - forward an external mailbox to mailbox A managed by this project, then configure the external mailbox as an alias of A to read all mail through this tool
- 📬 **Mail viewing** - inbox and junk mail in the web UI; API supports `inbox`, `junkemail`, `deleteditems`, and `all`
- 📎 **Attachment downloads** - download one attachment or all attachments as a ZIP
- 🔍 **Fullscreen view** - view mail in fullscreen mode
- 📤 **Export** - export mailbox accounts by group or all at once
- 🧩 **WebDAV backup** - upload the "export all groups" file to WebDAV on Cron or manually
- 🎨 **Modern UI** - four-column layout with clear account, mail list, and detail panes
- ⚡ **Performance tuning** - cached account and mail lists for faster switching
- 📄 **Infinite scroll** - load the next page automatically at the bottom (20 mails per page)
- 🔥 **Temporary mailboxes** - GPTMail + DuckMail + Cloudflare Temp Email integration for generation, import, reading, and detail viewing
- ⚙️ **System settings** - change password, API Key, and more online
- 🔄 **OAuth2 helper** - built-in auth flow to quickly get a Refresh Token
- 💾 **Mail cache** - smart list caching for instant switching
- 🏷️ **Tag management** - tag accounts, bulk operations, and filter by tag
- 📦 **Bulk group move** - move selected mailboxes to a target group
- ✅ **Bulk selection** - select all visible rows or clear selection in account and mail lists
- 🗑️ **Mail deletion** - delete one or many messages permanently
- 🔄 **API priority fallback** - Graph API -> IMAP (new) -> IMAP (legacy)
- 🔑 **External API** - fetch mail directly by API Key without logging in; supports aliases, aggregated folders, and multi-condition filters

#### Mail Forwarding
- 📮 **Per-account forwarding** - forwarding can be enabled or disabled per account
- 📨 **Multiple channels** - SMTP forwarding and Telegram forwarding are supported
- ⏱️ **Time window control** - only forward mail received within the last X minutes
- 🗑️ **Optional junk mail forwarding** - decide whether junk mail is forwarded too
- 📚 **Forwarding history** - view recent forwarding records and failures
- ▶️ **Manual trigger** - trigger one forwarding check from the UI

#### Token Refresh Management
- 🔁 **Full refresh** - refresh all Outlook/Hotmail OAuth account tokens at once
- ⏰ **Scheduled refresh** - run by day interval or Cron expression; works in Docker / Docker Compose too
- 📊 **Refresh statistics** - live count of failed mailboxes
- 📜 **Refresh history** - complete history for the last six months

#### WebDAV Backup
- 🗂️ **Full-group backups** - backup files reuse the "export all groups" format, including regular and temporary mailbox data
- ⏲️ **Cron uploads** - supports 5-field Cron expressions and uses the application time zone for next-run calculation
- 🧪 **Connection test** - upload and clean up a test file to verify the WebDAV directory is writable
- 🔐 **Sensitive-action confirmation** - changing backup settings or uploading a real backup requires password re-authentication

#### Security Features
- 🛡️ XSS protection | 🔒 CSRF protection | 🔐 data encryption | 🚦 rate limiting | 📋 audit logs | 🔑 secondary verification

### Layout

The web app uses a four-column layout:

1. **Group panel** - shows all mailbox groups and switches on click
2. **Mailbox panel** - shows the mailbox list for the selected group
3. **Mail list** - shows emails for the selected mailbox, with folder switching and scroll loading
4. **Mail details** - shows full content for the selected mail, including HTML rendering

## 📸 Screenshots

### Mailbox List
![Mailbox list](img/邮箱列表.png)

### Global Search
![Global search](img/全局搜索.png)

### Import Mailboxes
![Import mailboxes](img/导入邮箱账号.png)

### Token Refresh Management
![Full token refresh](img/全量刷新token.png)

### Tag Management
![Tag management](img/标签管理.png)

## 📖 Usage

### 1. Get OAuth2 Credentials (optional)

If you buy accounts that already include a token, you can skip this step. The project also ships with a default client ID. If you skip this step, the default client ID will be used and you can start from step 5.

To use this tool, you need the following OAuth2 credentials:

1. **Client ID** - the Microsoft Azure application registration client ID
2. **Refresh Token** - the OAuth2 refresh token

#### Step 1: Register an Azure app

Visit [Azure Portal](https://portal.azure.com/) and open "App registrations".

![App registrations](img/应用注册.png)

#### Step 2: Create a new app

Click "New registration" and fill in the application details.

![Register app](img/注册应用程序.png)

- **Name**: custom app name
- **Supported account types**: choose "Accounts in any organizational directory and personal Microsoft accounts"
- **Redirect URI**: choose "Public client/native" and enter `http://localhost:8080`

#### Step 3: Get the application ID

After creation, copy the "Application (client) ID".

![Get application ID](img/获取应用程序ID.png)

#### Step 4: Configure API permissions

This step can usually be skipped. The built-in client ID works without it.

Add the following permissions under "API permissions":
- `offline_access` - get a refresh token
- `Mail.Read` - read mail
- `Mail.ReadWrite` - read and write mail
- `User.Read` - read user info
- `IMAP.AccessAsUser.All` - IMAP access

#### Step 5: Get a Refresh Token

Use the built-in OAuth2 helper to obtain a Refresh Token:

![Exchange token](img/换取token.png)

1. Click "Get Token" in the web UI
2. Click "Generate authorization link"
3. Open the link in your browser and complete authorization
4. Copy the full URL after authorization. For security reasons, I did not build a unified authorization callback service. All authorization is completed inside your own deployed service, so nothing is leaked. The redirect URI is `http://localhost:8080`, which cannot actually be opened, so copy the callback URL back into the deployed service and continue the Refresh Token exchange there
5. Paste it into the "Authorized URL" field
6. Click "Exchange Token"
7. Copy the returned Refresh Token

### 2. Import Mailboxes

After clicking "Import Mailboxes" in the web UI, choose the import format for the mailbox type.

#### Outlook/Hotmail OAuth

Two formats are supported:

```txt
email----password----client_id----refresh_token
email----password----refresh_token----client_id
```

Example:

```txt
user@outlook.com----password123----24d9a0ed-8787-4584-883c-2fd79308940a----0.AXEA...
```

#### Standard IMAP Mailboxes

For Gmail, QQ, 163, 126, Yahoo, Aliyun Mail, and others:

```txt
email----IMAP app password / authorization code
```

Example:

```txt
user@gmail.com----app-password
user@qq.com----imap-auth-code
```

#### Custom IMAP

Two formats are supported:

```txt
email----IMAP password
email----IMAP password----imap_host----imap_port
```

Example:

```txt
user@example.com----app-password
user@example.com----app-password----imap.example.com----993
```

Bulk import is supported, one account per line. During import, you can choose whether forwarding should be enabled immediately. Regular mailbox import cannot select the temporary mailbox group.

### 3. Read Mail

1. Select a group from the left panel
2. Select a mailbox account
3. Click the "Fetch Mail" button
4. Switch between "Inbox" and "Junk Mail" in the web UI
5. Scroll to the bottom of the list to automatically load the next page (20 mails per page)
6. Click a mail to see its details, with HTML rendering and fullscreen support
7. If you need `deleteditems` or `all` aggregated results, use the external API or internal API

### 4. Alias Management

1. Open "Edit Account" for a mailbox
2. Enter multiple aliases, one per line, in "Alias Email"
3. Save, and both the primary email and aliases will point to the same account

Useful for:

- One account with multiple registration email names
- Sites using addresses such as `user+tag@example.com`
- External mail forwarded into a managed mailbox, while still wanting to read it through the original address

### 5. Mail Forwarding

Mail forwarding is controlled at two levels:

1. **Per-account switch**
   When importing or editing an account, choose whether that account participates in forwarding
2. **Global forwarding settings**
   Configure the following in "Settings -> Mail Forwarding Settings":
   - Poll interval
   - Mail time window
   - Whether junk mail is forwarded
   - Forwarding channels (SMTP / Telegram)
   - Detailed SMTP / Telegram parameters

Additional notes:

- Forwarding polls only process accounts that have forwarding enabled
- You can manually trigger one forwarding check
- You can view recent forwarding history and failures

### 6. WebDAV Backup

Configure this in "Settings -> WebDAV Backup":

1. Enter the WebDAV directory URL, for example `https://dav.example.com/backups`
2. Fill in the WebDAV username and password / App Password as needed
3. Enter a 5-field Cron expression, for example `0 3 * * *`
4. Click "Calculate next run" to confirm the Cron preview; the time uses the application time zone from the general settings
5. Click "Test WebDAV" to verify the directory is writable; the test uploads only a temporary file and does not require the login password
6. When changing backup settings, enter the login password in the "Sensitive action confirmation" prompt before saving

Additional notes:

- Scheduled backups upload the same text file format as "Export all groups", with file names like `all_groups_backup_YYYYMMDD_HHMMSS.txt`
- "Manual upload" uploads the real backup file immediately and requires the login password
- WebDAV backups include sensitive data such as accounts, tokens, and temporary mailbox credentials, so use a dedicated WebDAV directory and restrict access carefully

### 7. External API

Fetch mail directly with an API Key, no web login required.

Also supported:

- Use the primary email or an alias to fetch mail
- `folder=all` fetches inbox and junk mail together, sorted by normalized mail time in descending order, and `top` is calculated per folder
- Filter lists by subject, sender, or keyword
- Support special-character aliases such as `user+alias@example.com`
- Default `top=1`

**Setup:**
1. Click "Settings" -> "External API Key" -> "Generate random" -> Save

**Examples:**
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

If the mailbox or alias contains special characters:

- `@` can be passed directly
- `+` should be encoded as `%2B`
- `&` must be encoded as `%26`

If you automatically forward external mailbox B into managed mailbox A, and then configure B as an alias of A, you can later call the external API directly with B as the `email` parameter.

See [API Documentation](docs/api.md) for the full details.

## 📚 Detailed Docs

| Doc | Description |
|------|------|
| [🚀 Deployment Guide](docs/deployment.md) | Docker, Docker Compose, Nginx/Caddy deployment, environment variables |
| [⬆️ Upgrade Guide](docs/upgrade.md) | Upgrade and rollback guidance for Windows, Docker, and direct Python runs |
| [🔐 Security Configuration](docs/security.md) | XSS/CSRF protection, encryption, rate limiting, audit logs |
| [📡 API Documentation](docs/api.md) | External API, full API, proxy configuration |
| [🛠️ Troubleshooting](docs/troubleshooting.md) | Common problems and troubleshooting steps |
| [📋 Changelog](CHANGELOG.md) | Version history |
| [🚢 Release Guide](RELEASE.md) | Standard release flow, version rules, GitHub Release notes |
| [🛡️ Branch Protection Recommendations](BRANCH_PROTECTION.md) | `main` / `dev` boundaries, protection rules, build trigger guidance |

## 🏗️ Architecture

### Backend Stack
- **Flask 3.0+** - Web framework
- **SQLite 3** - Database
- **Requests / requests[socks]** - HTTP client and proxy support
- **IMAP4_SSL** - IMAP protocol support
- **Microsoft Graph API** - Outlook/Hotmail mail API
- **APScheduler + croniter** - Scheduled refresh and forwarding polls
- **bcrypt + cryptography** - Password hashing and sensitive field encryption

### Frontend Stack
- **Vanilla JavaScript** - No framework dependency
- **CSS3** - Modern styling
- **Fetch API** - Async requests
- **DOMPurify 3.0.8** - HTML sanitization

### System Requirements
- Python 3.9+
- SQLite 3
- Docker (optional)
- 2GB+ RAM

## 📝 Dependencies

```txt
flask>=3.0.0
flask-wtf>=1.2.0          # CSRF protection (recommended)
werkzeug>=3.0.0
requests[socks]>=2.25.0   # HTTP requests and proxy support
APScheduler>=3.10.0       # Scheduled jobs
croniter>=1.3.0           # Cron parsing
bcrypt>=4.0.0             # Password hashing
cryptography>=41.0.0      # Data encryption
```

## FAQ

### How do I get an app password for Gmail?

Enable 2FA, then create an app password here:

https://support.google.com/mail/answer/185833?hl=en

### How do I get Telegram group IDs and user IDs?

#### Get a personal ID (User ID)
Search for `@userinfobot` or `@getmyid_bot` in Telegram.

Tap Start.

The bot will reply with your User ID immediately, which is a number.

To find someone else's ID, forward one of their messages to the bot and it will show that user's ID.

#### Get a group ID (Group ID)
Add one of the bots above, such as `@getmyid_bot`, to your group.

Type `/myid` in the group, or use the command specified by the bot.

The bot will return the group ID.

Note: normal group IDs usually start with a number, while **supergroup** or **channel** IDs usually start with `-100`.

## 🤝 Contributing

Issues and pull requests are welcome!

```bash
git clone https://github.com/assast/outlookEmail.git
cd outlookEmail
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python web_outlook_app.py
```
