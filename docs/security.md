# Security Configuration

## 1. Change the Default Password

**Option 1: Via environment variables**

In `docker-compose.yml`:
```yaml
environment:
  - LOGIN_PASSWORD=your_secure_password_here
  - SECRET_KEY=your-random-secret-key-here
```

**Option 2: Via the Web UI**

After logging in, click the "Settings" button to change the login password online.

## 2. Enable CSRF Protection (Recommended)

CSRF protection is enabled by default. If `flask-wtf` is not installed, the system degrades gracefully:

```bash
pip install flask-wtf>=1.2.0
```

**CSRF features:**
- Automatically adds a CSRF token to all state-changing requests
- Helps prevent cross-site request forgery attacks
- Transparent to users, no manual steps required
- Falls back gracefully when not installed, without breaking functionality

## 3. Login Rate Limiting

The system includes built-in login rate limiting to prevent brute-force attacks:

- **Failure limit**: locked after 5 failed attempts
- **Lock duration**: 15 minutes
- **Per-IP tracking**: each IP is counted independently
- **Automatic unlock**: unlocked after the lock duration expires

## 4. Encrypt Sensitive Data

All sensitive data is encrypted at rest:

**Encrypted content:**
- Refresh tokens (Fernet symmetric encryption)
- Login passwords (bcrypt hashes)
- Mailbox passwords (Fernet symmetric encryption)
- External API keys (Fernet symmetric encryption)

**Encryption key:**
- Derived from `SECRET_KEY`
- Uses the `PBKDF2HMAC` key derivation function
- 100,000 iterations with SHA256

**Important:**
- `SECRET_KEY` must remain unchanged
- The Windows `exe` auto-generates and persists `SECRET_KEY` on first launch
- Docker, direct Python runs, and production environments should set a fixed `SECRET_KEY` explicitly
- Changing `SECRET_KEY` will make existing stored data impossible to decrypt
- If you must change it, export the accounts first, then re-import after the change

## 5. Double-Check Exports

Export features require password confirmation to prevent unauthorized data export:

**Protection mechanism:**
- The login password must be entered before exporting
- A one-time verification token is issued and expires after use
- All export operations are recorded in the audit log
- Operation time, IP address, and export details are logged

**Audit log query:**
```sql
SELECT * FROM audit_logs WHERE action = 'export' ORDER BY created_at DESC;
```

## 6. XSS Protection

Multiple layers of XSS protection are used:

**Frontend protection:**
- User input is escaped automatically (`escapeHtml`)
- Mail content is sanitized with DOMPurify
- iframe sandbox isolation (`sandbox="allow-same-origin"`)

**Backend protection:**
- Input sanitization function (`sanitize_input`)
- Escaping of HTML special characters
- Length limits and control-character filtering

**DOMPurify configuration:**
```javascript
DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'div', ...],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', ...],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', ...]
});
```

## 7. Configure the Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw enable
```

## 8. Restrict Access Sources (Nginx)

```nginx
location / {
    allow 192.168.1.0/24;
    deny all;
    proxy_pass http://localhost:5000;
}
```

## 9. Use Strong Passwords

- The login password should be at least 8 characters and include uppercase letters, lowercase letters, numbers, and special characters
- `SECRET_KEY` should be a randomly generated long string (at least 32 bytes)
- Generate one with: `python -c 'import secrets; print(secrets.token_hex(32))'`
- Rotate passwords periodically

## 10. Back Up Your Data

```bash
# Back up the database
cp data/outlook_accounts.db data/outlook_accounts.db.backup

# Scheduled backup (crontab)
0 2 * * * cp /path/to/data/outlook_accounts.db /path/to/backup/outlook_accounts.db.$(date +\%Y\%m\%d)
```

## Security Best Practices

1. **Keep `SECRET_KEY` fixed**: server deployments must set it explicitly; the desktop build should preserve the auto-generated key file
2. **Enable HTTPS**: use SSL/TLS encryption in production
3. **Update regularly**: keep the application on the latest version
4. **Monitor logs**: review audit logs and application logs regularly
5. **Restrict access**: use a firewall and Nginx to limit access sources
6. **Back up data**: back up the database file regularly
7. **Use strong passwords**: use complex passwords and rotate them periodically
8. **Install CSRF protection**: `pip install flask-wtf`
