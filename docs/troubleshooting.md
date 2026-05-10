# Troubleshooting and FAQs

## Troubleshooting

### Container Will Not Start

**Checks:**

```bash
# 1. Check container status
docker ps -a

# 2. Check application logs
docker logs outlook-mail-reader

# 3. Check whether the port is already in use
lsof -i :5000

# 4. Pull the image again and restart
docker pull ghcr.io/assast/outlookemail:latest
docker-compose down
docker-compose up -d
```

**Expected logs should look like:**
```
============================================================
Outlook Mail Web App initialized
Database file: data/outlook_accounts.db
GPTMail API: https://mail.chatgpt.org.uk
============================================================
```

### Database Table Missing

**Error:** `sqlite3.OperationalError: no such table: settings`

**Cause:** The database was not initialized or is corrupted

**Fix:**

```bash
# Option 1: Delete the old database and reinitialize it
docker-compose down
rm -rf data/outlook_accounts.db
docker-compose up -d

# Option 2: Initialize the database manually
docker exec outlook-mail-reader python -c "from web_outlook_app import init_db; init_db()"
docker-compose restart

# Option 3: Use the latest image
docker pull ghcr.io/assast/outlookemail:latest
docker-compose down
docker-compose up -d
```

### Unable to Fetch Mail

**Possible causes:**
1. Refresh Token expired or invalid
2. Client ID is wrong
3. API permissions are insufficient
4. Network connectivity issues

**Fix:**

1. **Re-acquire the Refresh Token** - use the built-in OAuth2 helper again
2. **Check API permissions** - make sure the required permissions have been added
3. **Inspect the detailed error** - open the browser developer tools (F12) and check the Network tab

### 502 Error (Nginx)

**Cause:** The app did not start correctly or the port configuration is wrong

```bash
docker ps
docker-compose logs
curl http://localhost:5000/login
sudo nginx -t
docker-compose restart
sudo systemctl reload nginx
```

### Temporary Mailbox Features Not Working

1. **Update the API Key** - update the GPTMail API Key in "Settings"
2. **Check service status** - visit the GPTMail website and confirm the service is up

### Session Expired

1. **Set a fixed `SECRET_KEY` in server deployments**
   ```yaml
   environment:
     - SECRET_KEY=your-fixed-secret-key-here
   ```
   Generate one with `python -c 'import secrets; print(secrets.token_hex(32))'`

   If you use the Windows `exe`, the app automatically generates and saves a fixed `SECRET_KEY` on first launch. Do not delete the key file in the data directory.

2. The default session lifetime is 7 days, and restarting the app will not invalidate the session when a fixed `SECRET_KEY` is used.

### Database Locked

**Error:** `sqlite3.OperationalError: database is locked`

```bash
docker-compose restart
lsof data/outlook_accounts.db
cp data/outlook_accounts.db data/outlook_accounts.db.backup
docker-compose down
docker-compose up -d
```

---

## FAQs

### Q: Why can't I fetch mail?
A: Check: (1) whether the Refresh Token is valid, (2) whether the Client ID is correct, (3) whether the Azure app has the required permissions, (4) whether the network is working, and (5) try obtaining the token again.

### Q: How do I get a Refresh Token?
A: Use the built-in OAuth2 helper: click "Get Token" -> "Generate authorization link" -> authorize in the browser -> copy the callback URL -> paste it into the token exchange form.

### Q: How do I use temporary mailboxes?
A: Click the "Temporary Mailbox" group -> "Generate temporary mailbox" -> choose a mailbox -> "Fetch Mail".

### Q: How do I change the login password?
A: (1) In the web UI under "Settings" or (2) via the environment variable `LOGIN_PASSWORD`.

### Q: Where is data stored?
A: In the SQLite database `data/outlook_accounts.db`; regular backups are recommended.

### Q: Which mail folders are supported?
A: Inbox, Junk Email, and Deleted Items.

### Q: How do I bulk import mailboxes?
A: Default format: `email----password----client_id----refresh_token`, one per line. You can also switch the import dialog to `email----password----refresh_token----client_id`.

### Q: How do I export mailbox accounts?
A: (1) Export one group (2) Export all (3) Export selected groups.

### Q: What should I do if the Docker container will not start?
A: (1) `docker logs outlook-mail-reader` (2) check the port (3) check directory permissions (4) pull the latest image.
