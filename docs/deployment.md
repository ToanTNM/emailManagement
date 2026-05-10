# Deployment Guide

## Option 1: Windows `exe`

Download the matching `OutlookEmail-windows-x64-*.zip` from GitHub Releases, extract it, and run `OutlookEmail.exe` directly.

**On first launch, the desktop build will automatically:**
- Create the local data directory
- Initialize the database
- Generate and persist `SECRET_KEY`

**Default Windows data directory:**
- `%APPDATA%\OutlookEmail`

The default access address is still `http://127.0.0.1:5000`.

## Option 2: Docker (recommended for servers)

Use the image built automatically by GitHub Actions without building locally:

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

# View logs
docker logs -f outlook-mail-reader

# Stop the container
docker stop outlook-mail-reader
docker rm outlook-mail-reader
```

**On first start, it will automatically:**
- Create the data directory
- Initialize the database
- Create the default group and temporary mailbox group
- Set the default password (`admin123`)

## Option 3: Run Directly with Python

```bash
# Clone the repository
git clone https://github.com/assast/outlookEmail.git
cd outlookEmail

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export LOGIN_PASSWORD=admin123
export SECRET_KEY=your-secret-key-here
export PORT=5000

# Run the app
python web_outlook_app.py
```

Open `http://localhost:5000` to use the app.
For server deployments, always set a fixed `SECRET_KEY` explicitly.

## Runtime Mode Notes

The service must run with a single worker. Token refresh management, stream-based tasks, and export verification rely on in-process state. If you run multiple workers in a custom deployment, the POST task initialization and the later SSE subscription may land in different processes, which can make the task appear missing or expired.

The official Docker image is fixed to Gunicorn single-worker mode and uses threads for slow requests:

```bash
gunicorn -k gthread -w 1 --threads ${GUNICORN_THREADS:-4} ...
```

If you need more concurrency, increase `GUNICORN_THREADS` first. Do not increase the worker count.

## Using Docker Compose

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
      - GPTMAIL_API_KEY=your-api-key
    restart: unless-stopped
```

```bash
# Start the service
docker-compose up -d

# View scheduled-task startup logs (you should see "scheduled tasks started")
docker-compose logs -f

# Stop the service
docker-compose down
```

## Scheduled Refresh Notes

- The app automatically initializes scheduled tasks in `python web_outlook_app.py`, Docker, Docker Compose, and Gunicorn single-worker mode.
- To confirm whether scheduled tasks started, run `docker-compose logs -f`; the logs should include "scheduled tasks started".
- If you use Cron mode, make sure `use_cron_schedule` is enabled in system settings and that the 5-field Cron expression is correct.

## Environment Variables

| Variable | Description | Default |
|--------|--------|--------|
| `SECRET_KEY` | Session key (strongly recommended to set explicitly in server deployments) | The Windows `exe` auto-generates and persists it on first launch; Docker / Python / production deployments should set a fixed value explicitly. Do not change it casually, or stored sensitive data will become undecryptable. |
| `LOGIN_PASSWORD` | Login password | `admin123` |
| `FLASK_ENV` | Runtime environment | `production` |
| `PORT` | Application port | `5000` |
| `HOST` | Bind address | `0.0.0.0` |
| `DATABASE_PATH` | Database path | `data/outlook_accounts.db` |
| `GPTMAIL_BASE_URL` | GPTMail API base URL | `https://mail.chatgpt.org.uk` |
| `GPTMAIL_API_KEY` | GPTMail API Key | `gpt-test` |
| `DUCKMAIL_BASE_URL` | DuckMail API base URL | `https://api.duckmail.sbs` |
| `DUCKMAIL_API_KEY` | DuckMail API Key | Empty |
| `CLOUDFLARE_WORKER_DOMAIN` | Cloudflare Temp Email Worker domain; also reads `WORKER_DOMAIN` | Empty |
| `CLOUDFLARE_EMAIL_DOMAINS` | Cloudflare temporary mailbox domain list, comma-separated; also reads `EMAIL_DOMAIN` | Empty |
| `CLOUDFLARE_ADMIN_PASSWORD` | Cloudflare admin password; also reads `ADMIN_PASSWORD` | Empty |
| `OAUTH_CLIENT_ID` | OAuth client ID | `Use your own if possible; if you cannot obtain one, the default value will be used` |
| `OAUTH_REDIRECT_URI` | OAuth redirect URI | `Use your own if possible; if you cannot obtain one, the default value will be used` |

**Generate `SECRET_KEY`:**
```bash
python -c 'import secrets; print(secrets.token_hex(32))'
```

## Data Persistence

The database file is stored in `./data` and persisted through a Docker volume.

The database contains the following tables:
- `settings` - system settings (login password, API Key, etc.)
- `groups` - mailbox groups
- `accounts` - Outlook mailbox accounts
- `account_refresh_logs` - account refresh logs
- `temp_emails` - temporary mailboxes
- `temp_email_messages` - temporary mailbox messages

## Port Mapping

The default mapping uses port 5000. You can change it in `docker-compose.yml`:

```yaml
ports:
  - "8080:5000"  # Map container port 5000 to host port 8080
```

## Image Notes

The project uses GitHub Actions to automatically build and push Docker images, supporting stable, development, and release version tags.

### Available Image Tags

- `ghcr.io/assast/outlookemail:latest` - most recent eligible stable build from the default branch
- `ghcr.io/assast/outlookemail:main` - most recent eligible build from `main`
- `ghcr.io/assast/outlookemail:dev` - most recent eligible build from `dev`
- `ghcr.io/assast/outlookemail:vX.Y.Z` - specific release image generated by the manual release workflow

Additional notes:

- Documentation changes do not trigger Docker image rebuilds
- For formal releases, prefer an explicit `vX.Y.Z` tag
- See `RELEASE.md` in the repository root for the full release flow

### Update the Image

```bash
docker pull ghcr.io/assast/outlookemail:latest
docker-compose down
docker-compose up -d
```

### Build the Image Yourself (Optional)

```bash
docker build -t outlook-mail-reader .
docker run -d \
  --name outlook-mail-reader \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -e LOGIN_PASSWORD=admin123 \
  outlook-mail-reader
```

## Production Deployment

### Using Nginx + HTTPS

**1. Install Nginx**
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

**2. Configure Nginx** `/etc/nginx/sites-available/outlook-mail-reader`
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support, if needed
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**3. Enable the config**
```bash
sudo ln -s /etc/nginx/sites-available/outlook-mail-reader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**4. Configure HTTPS**
```bash
sudo certbot --nginx -d your-domain.com
```

### Using Caddy (simpler)

```bash
sudo apt install caddy -y

# Configure /etc/caddy/Caddyfile
your-domain.com {
    reverse_proxy localhost:5000
}

# Reload (automatic HTTPS)
sudo systemctl reload caddy
```
