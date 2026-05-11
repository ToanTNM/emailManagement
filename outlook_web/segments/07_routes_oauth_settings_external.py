from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    # These segmented files are executed into the shared `web_outlook_app`
    # globals at runtime. Importing from the assembled module keeps IDE
    # inspections from flagging the shared names as unresolved.
    from web_outlook_app import *  # noqa: F403


# ==================== OAuth Token API ====================

@app.route('/api/oauth/auth-url', methods=['GET'])
@login_required
def api_get_oauth_auth_url():
    """生成 OAuth 授权 URL"""
    import urllib.parse

    base_auth_url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    params = {
        "client_id": OAUTH_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": OAUTH_REDIRECT_URI,
        "response_mode": "query",
        "scope": " ".join(OAUTH_SCOPES),
        "state": "12345"
    }
    auth_url = f"{base_auth_url}?{urllib.parse.urlencode(params)}"

    return jsonify({
        'success': True,
        'auth_url': auth_url,
        'client_id': OAUTH_CLIENT_ID,
        'redirect_uri': OAUTH_REDIRECT_URI
    })


@app.route('/api/oauth/exchange-token', methods=['POST'])
@login_required
def api_exchange_oauth_token():
    """使用授权码换取 Refresh Token"""
    import urllib.parse

    data = request.json
    redirected_url = data.get('redirected_url', '').strip()

    if not redirected_url:
        return jsonify({'success': False, 'error': 'Please provide the full redirected URL'})

    # 从 URL 中提取 code
    try:
        parsed_url = urllib.parse.urlparse(redirected_url)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        auth_code = query_params['code'][0]
    except (KeyError, IndexError):
        return jsonify({'success': False, 'error': 'Could not extract the authorization code from the URL. Please verify the URL'})

    # 使用 Code 换取 Token (Public Client 不需要 client_secret)
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    token_data = {
        "client_id": OAUTH_CLIENT_ID,
        "code": auth_code,
        "redirect_uri": OAUTH_REDIRECT_URI,
        "grant_type": "authorization_code",
        "scope": " ".join(OAUTH_SCOPES)
    }

    try:
        response = requests.post(token_url, data=token_data, timeout=30)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Request failed: {str(e)}'})

    if response.status_code == 200:
        tokens = response.json()
        refresh_token = tokens.get('refresh_token')

        if not refresh_token:
            return jsonify({'success': False, 'error': 'Refresh Token was not returned'})

        return jsonify({
            'success': True,
            'refresh_token': refresh_token,
            'client_id': OAUTH_CLIENT_ID,
            'token_type': tokens.get('token_type'),
            'expires_in': tokens.get('expires_in'),
            'scope': tokens.get('scope')
        })
    else:
        error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
        error_msg = error_data.get('error_description', response.text)
        return jsonify({'success': False, 'error': f'Failed to obtain token: {error_msg}'})


# ==================== 设置 API ====================

WEBDAV_BACKUP_SETTING_KEYS = (
    'webdav_backup_enabled',
    'webdav_backup_url',
    'webdav_backup_username',
    'webdav_backup_password',
    'webdav_backup_cron',
)


def normalize_bool_setting_value(value) -> str:
    return 'true' if str(value).strip().lower() in ('1', 'true', 'yes', 'on') else 'false'


def normalize_webdav_backup_setting_value(key: str, value) -> str:
    if key == 'webdav_backup_enabled':
        return normalize_bool_setting_value(value)
    return str(value or '').strip()


def get_current_webdav_backup_setting_value(key: str) -> str:
    if key == 'webdav_backup_password':
        return get_setting_decrypted(key, '')
    if key == 'webdav_backup_enabled':
        return normalize_bool_setting_value(get_setting(key, 'false'))
    if key == 'webdav_backup_cron':
        return get_setting(key, '0 3 * * *')
    return get_setting(key, '')


def has_webdav_backup_setting_changes(data) -> bool:
    for key in WEBDAV_BACKUP_SETTING_KEYS:
        if key not in data:
            continue
        incoming_value = normalize_webdav_backup_setting_value(key, data.get(key))
        current_value = normalize_webdav_backup_setting_value(key, get_current_webdav_backup_setting_value(key))
        if incoming_value != current_value:
            return True
    return False


def validate_cron_expression_for_timezone(cron_expr: str, time_zone: str):
    if not cron_expr:
        return 'Cron expression is required'
    if not is_valid_app_timezone_name(time_zone):
        return 'Invalid time zone'
    try:
        from croniter import croniter
        from datetime import datetime
        croniter(cron_expr, datetime.now(ZoneInfo(time_zone)))
        return None
    except ImportError:
        return 'croniter is not installed'
    except Exception as exc:
        return f'Invalid cron expression: {str(exc)}'


def validate_five_field_cron_expression_for_timezone(cron_expr: str, time_zone: str):
    normalized = str(cron_expr or '').strip()
    if not normalized:
        return 'Cron expression is required'
    if len(normalized.split()) != 5:
        return 'Only 5-field cron expressions are supported'
    return validate_cron_expression_for_timezone(normalized, time_zone)


def build_cron_preview(cron_expr: str, time_zone: str, count: int = 5):
    from croniter import croniter
    from datetime import datetime

    tzinfo = ZoneInfo(time_zone)
    base_time = datetime.now(tzinfo)
    cron = croniter(cron_expr, base_time)
    next_run = cron.get_next(datetime)
    if next_run.tzinfo is None:
        next_run = next_run.replace(tzinfo=tzinfo)

    future_runs = [next_run.isoformat()]
    for _ in range(max(0, count - 1)):
        future_run = cron.get_next(datetime)
        if future_run.tzinfo is None:
            future_run = future_run.replace(tzinfo=tzinfo)
        future_runs.append(future_run.isoformat())

    return {
        'next_run': next_run.isoformat(),
        'future_runs': future_runs,
        'time_zone': time_zone,
    }


@app.route('/api/settings/validate-cron', methods=['POST'])
@login_required
def api_validate_cron():
    """验证 Cron 表达式"""
    try:
        from croniter import croniter  # noqa: F401
    except ImportError:
        return jsonify({'success': False, 'error': 'croniter is not installed. Run: pip install croniter'})

    data = request.json or {}
    cron_expr = data.get('cron_expression', '').strip()
    requested_timezone = str(data.get('time_zone', '')).strip()
    expected_fields = data.get('expected_fields')

    if not cron_expr:
        return jsonify({'success': False, 'error': 'Cron expression is required'})

    if expected_fields is not None:
        try:
            expected_field_count = int(expected_fields)
        except (TypeError, ValueError):
            expected_field_count = 0
        if expected_field_count > 0 and len(cron_expr.split()) != expected_field_count:
            return jsonify({
                'success': False,
                'valid': False,
                'error': f'Only {expected_field_count}-field cron expressions are supported'
            })

    if requested_timezone and not is_valid_app_timezone_name(requested_timezone):
        return jsonify({'success': False, 'error': 'Invalid time zone'})

    preview_timezone = normalize_app_timezone_name(requested_timezone, get_app_timezone())

    try:
        preview = build_cron_preview(cron_expr, preview_timezone)
        return jsonify({
            'success': True,
            'valid': True,
            'next_run': preview['next_run'],
            'future_runs': preview['future_runs'],
            'time_zone': preview['time_zone']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'valid': False,
            'error': f'Invalid cron expression: {str(e)}'
        })


@app.route('/api/settings', methods=['GET'])
@login_required
def api_get_settings():
    """获取所有设置"""
    settings = get_all_settings()
    # 隐藏密码的部分字符
    if 'login_password' in settings:
        pwd = settings['login_password']
        if len(pwd) > 2:
            settings['login_password_masked'] = pwd[0] + '*' * (len(pwd) - 2) + pwd[-1]
        else:
            settings['login_password_masked'] = '*' * len(pwd)
    # 返回解密后的对外 API Key
    settings['external_api_key'] = get_external_api_key()
    # 返回 DuckMail 设置
    settings['duckmail_base_url'] = get_duckmail_base_url()
    settings['duckmail_api_key'] = get_duckmail_api_key()
    settings['cloudflare_worker_domain'] = get_cloudflare_worker_domain()
    settings['cloudflare_email_domains'] = ', '.join(get_cloudflare_email_domains())
    settings['cloudflare_admin_password'] = get_cloudflare_admin_password()
    settings['app_timezone'] = get_app_timezone()
    settings['show_account_created_at'] = get_setting('show_account_created_at', 'true')
    settings['show_account_sort_order'] = get_setting('show_account_sort_order', 'false')
    settings['show_group_id'] = get_setting('show_group_id', 'true')
    settings['forward_channels'] = get_forward_channels()
    settings['forward_check_interval_minutes'] = get_setting('forward_check_interval_minutes', '5')
    settings['forward_account_delay_seconds'] = get_setting('forward_account_delay_seconds', '0')
    settings['forward_email_window_minutes'] = get_setting('forward_email_window_minutes', '0')
    settings['forward_include_junkemail'] = get_setting('forward_include_junkemail', 'false')
    settings['email_forward_recipient'] = get_setting('email_forward_recipient', '')
    settings['smtp_host'] = get_setting('smtp_host', '')
    settings['smtp_port'] = get_setting('smtp_port', '465')
    settings['smtp_username'] = get_setting('smtp_username', '')
    settings['smtp_password'] = get_setting_decrypted('smtp_password', '')
    settings['smtp_from_email'] = get_setting('smtp_from_email', '')
    settings['smtp_provider'] = normalize_smtp_forward_provider(get_setting('smtp_provider', 'custom'))
    settings['smtp_use_tls'] = get_setting('smtp_use_tls', 'false')
    settings['smtp_use_ssl'] = get_setting('smtp_use_ssl', 'true')
    settings['telegram_bot_token'] = get_setting_decrypted('telegram_bot_token', '')
    settings['telegram_chat_id'] = get_setting('telegram_chat_id', '')
    settings['telegram_proxy_url'] = get_setting('telegram_proxy_url', '')
    settings['wecom_webhook_url'] = get_setting_decrypted('wecom_webhook_url', '')
    settings['webdav_backup_enabled'] = get_setting('webdav_backup_enabled', 'false')
    settings['webdav_backup_url'] = get_setting('webdav_backup_url', '')
    settings['webdav_backup_username'] = get_setting('webdav_backup_username', '')
    settings['webdav_backup_password'] = get_setting_decrypted('webdav_backup_password', '')
    settings['webdav_backup_cron'] = get_setting('webdav_backup_cron', '0 3 * * *')
    settings['webdav_backup_last_run_at'] = get_setting('webdav_backup_last_run_at', '')
    settings['webdav_backup_last_status'] = get_setting('webdav_backup_last_status', '')
    settings['webdav_backup_last_message'] = get_setting('webdav_backup_last_message', '')
    settings['webdav_backup_last_filename'] = get_setting('webdav_backup_last_filename', '')
    settings['webdav_backup_next_run'] = ''
    cron_error = validate_five_field_cron_expression_for_timezone(settings['webdav_backup_cron'], settings['app_timezone'])
    if not cron_error:
        try:
            settings['webdav_backup_next_run'] = build_cron_preview(
                settings['webdav_backup_cron'],
                settings['app_timezone'],
                count=1,
            )['next_run']
        except Exception:
            settings['webdav_backup_next_run'] = ''
    return jsonify({'success': True, 'settings': settings})


@app.route('/api/settings', methods=['PUT'])
@login_required
def api_update_settings():
    """更新设置"""
    data = request.json or {}
    updated = []
    errors = []

    webdav_backup_changed = has_webdav_backup_setting_changes(data)
    if webdav_backup_changed:
        confirm_password = str(data.get('webdav_backup_verify_password', ''))
        if not confirm_password:
            return jsonify({'success': False, 'error': 'Login password verification is required before changing WebDAV backup settings'})
        if not verify_login_password(confirm_password):
            return jsonify({'success': False, 'error': 'WebDAV backup settings verification failed: incorrect login password'})

        proposed_backup = {
            key: normalize_webdav_backup_setting_value(key, get_current_webdav_backup_setting_value(key))
            for key in WEBDAV_BACKUP_SETTING_KEYS
        }
        for key in WEBDAV_BACKUP_SETTING_KEYS:
            if key in data:
                proposed_backup[key] = normalize_webdav_backup_setting_value(key, data.get(key))

        if proposed_backup['webdav_backup_enabled'] == 'true':
            backup_url = proposed_backup['webdav_backup_url']
            parsed_url = urlparse(backup_url)
            if not backup_url:
                return jsonify({'success': False, 'error': 'A WebDAV directory URL is required when WebDAV backup is enabled'})
            if parsed_url.scheme not in ('http', 'https') or not parsed_url.netloc:
                return jsonify({'success': False, 'error': 'The WebDAV directory URL must be a valid http(s) address'})

            backup_timezone = str(data.get('app_timezone') or get_app_timezone()).strip()
            backup_timezone = normalize_app_timezone_name(backup_timezone, get_app_timezone())
            cron_error = validate_five_field_cron_expression_for_timezone(proposed_backup['webdav_backup_cron'], backup_timezone)
            if cron_error:
                return jsonify({'success': False, 'error': cron_error})

    # 更新登录密码
    if 'login_password' in data:
        new_password = data['login_password'].strip()
        if new_password:
            if len(new_password) < 8:
                errors.append('Password must be at least 8 characters long')
            else:
                # 哈希新密码
                hashed_password = hash_password(new_password)
                if set_setting('login_password', hashed_password):
                    updated.append('Login password')
                else:
                    errors.append('Failed to update login password')

    # 更新 GPTMail API Key
    if 'gptmail_api_key' in data:
        new_api_key = data['gptmail_api_key'].strip()
        if new_api_key:
            if set_setting('gptmail_api_key', new_api_key):
                updated.append('GPTMail API Key')
            else:
                errors.append('Failed to update GPTMail API Key')

    # 更新刷新周期
    if 'refresh_interval_days' in data:
        try:
            days = int(data['refresh_interval_days'])
            if days < 1 or days > 90:
                errors.append('Refresh interval must be between 1 and 90 days')
            elif set_setting('refresh_interval_days', str(days)):
                updated.append('Refresh interval')
            else:
                errors.append('Failed to update refresh interval')
        except ValueError:
            errors.append('Refresh interval must be numeric')

    # 更新刷新间隔
    if 'refresh_delay_seconds' in data:
        try:
            seconds = int(data['refresh_delay_seconds'])
            if seconds < 0 or seconds > 60:
                errors.append('Refresh delay must be between 0 and 60 seconds')
            elif set_setting('refresh_delay_seconds', str(seconds)):
                updated.append('Refresh delay')
            else:
                errors.append('Failed to update refresh delay')
        except ValueError:
            errors.append('Refresh delay must be numeric')

    # 更新 Cron 表达式
    if 'refresh_cron' in data:
        cron_expr = data['refresh_cron'].strip()
        if cron_expr:
            try:
                from croniter import croniter
                from datetime import datetime
                croniter(cron_expr, datetime.now())
                if set_setting('refresh_cron', cron_expr):
                    updated.append('Cron expression')
                else:
                    errors.append('Failed to update cron expression')
            except ImportError:
                errors.append('croniter is not installed')
            except Exception as e:
                errors.append(f'Invalid cron expression: {str(e)}')

    # 更新刷新策略
    if 'use_cron_schedule' in data:
        use_cron = str(data['use_cron_schedule']).lower()
        if use_cron in ('true', 'false'):
            if set_setting('use_cron_schedule', use_cron):
                updated.append('Refresh strategy')
            else:
                errors.append('Failed to update refresh strategy')
        else:
            errors.append('Refresh strategy must be true or false')

    # 更新定时刷新开关
    if 'enable_scheduled_refresh' in data:
        enable = str(data['enable_scheduled_refresh']).lower()
        if enable in ('true', 'false'):
            if set_setting('enable_scheduled_refresh', enable):
                updated.append('Scheduled refresh toggle')
            else:
                errors.append('Failed to update the scheduled refresh toggle')
        else:
            errors.append('Scheduled refresh toggle must be true or false')

    if 'app_timezone' in data:
        app_timezone = str(data['app_timezone']).strip()
        if not is_valid_app_timezone_name(app_timezone):
            errors.append('Invalid time zone')
        elif set_setting('app_timezone', app_timezone):
            updated.append('Time zone')
        else:
            errors.append('Failed to save time zone')

    if 'show_account_created_at' in data:
        show_created_at = str(data['show_account_created_at']).lower()
        if show_created_at in ('true', 'false'):
            if set_setting('show_account_created_at', show_created_at):
                updated.append('Created-at display')
            else:
                errors.append('Failed to update created-at display')
        else:
            errors.append('Created-at display must be true or false')

    if 'show_account_sort_order' in data:
        show_sort_order = str(data['show_account_sort_order']).lower()
        if show_sort_order in ('true', 'false'):
            if set_setting('show_account_sort_order', show_sort_order):
                updated.append('Sort-order display')
            else:
                errors.append('Failed to update sort-order display')
        else:
            errors.append('Sort-order display must be true or false')

    if 'show_group_id' in data:
        show_group_id = str(data['show_group_id']).lower()
        if show_group_id in ('true', 'false'):
            if set_setting('show_group_id', show_group_id):
                updated.append('Group ID display')
            else:
                errors.append('Failed to update group ID display')
        else:
            errors.append('Group ID display must be true or false')

    # 更新对外 API Key
    if 'external_api_key' in data:
        new_ext_key = data['external_api_key'].strip()
        if new_ext_key:
            if set_setting('external_api_key', new_ext_key):
                updated.append('External API Key')
            else:
                errors.append('Failed to update the external API Key')
        else:
            if set_setting('external_api_key', ''):
                updated.append('External API Key (cleared)')

    # 更新 DuckMail 设置
    if 'duckmail_base_url' in data:
        new_url = data['duckmail_base_url'].strip()
        if set_setting('duckmail_base_url', new_url):
            updated.append('DuckMail API URL')
        else:
            errors.append('Failed to update the DuckMail API URL')

    if 'duckmail_api_key' in data:
        new_dk_key = data['duckmail_api_key'].strip()
        if set_setting('duckmail_api_key', new_dk_key):
            updated.append('DuckMail API Key')
        else:
            errors.append('Failed to update the DuckMail API Key')

    if 'cloudflare_worker_domain' in data:
        new_domain = data['cloudflare_worker_domain'].strip()
        if set_setting('cloudflare_worker_domain', new_domain):
            updated.append('Cloudflare Worker domain')
        else:
            errors.append('Failed to update the Cloudflare Worker domain')

    if 'cloudflare_email_domains' in data:
        new_domains = data['cloudflare_email_domains'].strip()
        if set_setting('cloudflare_email_domains', new_domains):
            updated.append('Cloudflare email domains')
        else:
            errors.append('Failed to update the Cloudflare email domains')

    if 'cloudflare_admin_password' in data:
        new_password = data['cloudflare_admin_password'].strip()
        if set_setting('cloudflare_admin_password', new_password):
            updated.append('Cloudflare admin password')
        else:
            errors.append('Failed to update the Cloudflare admin password')

    if 'forward_check_interval_minutes' in data:
        try:
            minutes = int(data['forward_check_interval_minutes'])
            if minutes < 1 or minutes > 60:
                errors.append('Forwarding check interval must be between 1 and 60 minutes')
            elif set_setting('forward_check_interval_minutes', str(minutes)):
                updated.append('Forwarding check interval')
            else:
                errors.append('Failed to save the forwarding check interval')
        except ValueError:
            errors.append('Forwarding check interval must be numeric')

    if 'forward_account_delay_seconds' in data:
        try:
            seconds = int(data['forward_account_delay_seconds'])
            if seconds < 0 or seconds > 60:
                errors.append('Per-account fetch delay must be between 0 and 60 seconds')
            elif set_setting('forward_account_delay_seconds', str(seconds)):
                updated.append('Per-account fetch delay')
            else:
                errors.append('Failed to save the per-account fetch delay')
        except ValueError:
            errors.append('Per-account fetch delay must be numeric')

    if 'forward_email_window_minutes' in data:
        try:
            minutes = int(data['forward_email_window_minutes'])
            if minutes < 0 or minutes > 10080:
                errors.append('Forward email time window must be between 0 and 10080 minutes')
            elif set_setting('forward_email_window_minutes', str(minutes)):
                updated.append('Forward email time window')
            else:
                errors.append('Failed to save the forward email time window')
        except ValueError:
            errors.append('Forward email time window must be numeric')

    if 'forward_include_junkemail' in data:
        include_junk = str(data['forward_include_junkemail']).lower()
        if include_junk in ('true', 'false'):
            if set_setting('forward_include_junkemail', include_junk):
                updated.append('Forward junk mail')
            else:
                errors.append('Failed to save the junk mail forwarding setting')
        else:
            errors.append('Forward junk mail must be true or false')

    if 'forward_channels' in data:
        forward_channels = normalize_forward_channel_settings(data['forward_channels'])
        stored_value = ','.join(forward_channels) if forward_channels else 'none'
        if set_setting('forward_channels', stored_value):
            updated.append('Forwarding channels')
        else:
            errors.append('Failed to save forwarding channels')

    if 'email_forward_recipient' in data:
        if set_setting('email_forward_recipient', data['email_forward_recipient'].strip()):
            updated.append('Email forwarding recipient')
        else:
            errors.append('Failed to save the email forwarding recipient')

    if 'smtp_host' in data:
        if set_setting('smtp_host', data['smtp_host'].strip()):
            updated.append('SMTP host')
        else:
            errors.append('Failed to save the SMTP host')

    if 'smtp_port' in data:
        try:
            smtp_port = int(data['smtp_port'])
            if smtp_port <= 0 or smtp_port > 65535:
                errors.append('Invalid SMTP port')
            elif set_setting('smtp_port', str(smtp_port)):
                updated.append('SMTP port')
            else:
                errors.append('Failed to save the SMTP port')
        except ValueError:
            errors.append('SMTP port must be numeric')

    if 'smtp_username' in data:
        if set_setting('smtp_username', data['smtp_username'].strip()):
            updated.append('SMTP username')
        else:
            errors.append('Failed to save the SMTP username')

    if 'smtp_password' in data:
        if set_setting_encrypted('smtp_password', data['smtp_password'].strip()):
            updated.append('SMTP password')
        else:
            errors.append('Failed to save the SMTP password')

    if 'smtp_from_email' in data:
        if set_setting('smtp_from_email', data['smtp_from_email'].strip()):
            updated.append('SMTP sender')
        else:
            errors.append('Failed to save the SMTP sender')

    if 'smtp_provider' in data:
        smtp_provider = normalize_smtp_forward_provider(data['smtp_provider'])
        if str(data['smtp_provider']).strip().lower() not in SMTP_FORWARD_PROVIDERS:
            errors.append('Invalid SMTP provider type')
        elif set_setting('smtp_provider', smtp_provider):
            updated.append('SMTP provider type')
        else:
            errors.append('Failed to save the SMTP provider type')

    if 'smtp_use_tls' in data:
        if set_setting('smtp_use_tls', str(data['smtp_use_tls']).lower()):
            updated.append('SMTP TLS')
        else:
            errors.append('Failed to save SMTP TLS')

    if 'smtp_use_ssl' in data:
        if set_setting('smtp_use_ssl', str(data['smtp_use_ssl']).lower()):
            updated.append('SMTP SSL')
        else:
            errors.append('Failed to save SMTP SSL')

    if 'telegram_bot_token' in data:
        if set_setting_encrypted('telegram_bot_token', data['telegram_bot_token'].strip()):
            updated.append('Telegram Bot Token')
        else:
            errors.append('Failed to save the Telegram Bot Token')

    if 'telegram_chat_id' in data:
        if set_setting('telegram_chat_id', data['telegram_chat_id'].strip()):
            updated.append('Telegram Chat ID')
        else:
            errors.append('Failed to save the Telegram Chat ID')

    if 'telegram_proxy_url' in data:
        if set_setting('telegram_proxy_url', data['telegram_proxy_url'].strip()):
            updated.append('Telegram proxy')
        else:
            errors.append('Failed to save the Telegram proxy')

    if 'wecom_webhook_url' in data:
        if set_setting_encrypted('wecom_webhook_url', data['wecom_webhook_url'].strip()):
            updated.append('WeCom webhook')
        else:
            errors.append('Failed to save the WeCom webhook')

    if 'webdav_backup_enabled' in data:
        enabled = normalize_bool_setting_value(data['webdav_backup_enabled'])
        if set_setting('webdav_backup_enabled', enabled):
            updated.append('WebDAV backup toggle')
        else:
            errors.append('Failed to save the WebDAV backup toggle')

    if 'webdav_backup_url' in data:
        if set_setting('webdav_backup_url', str(data['webdav_backup_url']).strip()):
            updated.append('WebDAV directory URL')
        else:
            errors.append('Failed to save the WebDAV directory URL')

    if 'webdav_backup_username' in data:
        if set_setting('webdav_backup_username', str(data['webdav_backup_username']).strip()):
            updated.append('WebDAV username')
        else:
            errors.append('Failed to save the WebDAV username')

    if 'webdav_backup_password' in data:
        if set_setting_encrypted('webdav_backup_password', str(data['webdav_backup_password']).strip()):
            updated.append('WebDAV password')
        else:
            errors.append('Failed to save the WebDAV password')

    if 'webdav_backup_cron' in data:
        cron_expr = str(data['webdav_backup_cron']).strip()
        backup_timezone = normalize_app_timezone_name(str(data.get('app_timezone') or get_app_timezone()).strip(), get_app_timezone())
        cron_error = validate_five_field_cron_expression_for_timezone(cron_expr, backup_timezone)
        if cron_error:
            errors.append(cron_error)
        elif set_setting('webdav_backup_cron', cron_expr):
            updated.append('WebDAV backup cron')
        else:
            errors.append('Failed to save the WebDAV backup cron')

    if errors:
        return jsonify({'success': False, 'error': '; '.join(errors)})

    if updated:
        return jsonify({'success': True, 'message': f'Updated: {", ".join(updated)}'})
    else:
        return jsonify({'success': False, 'error': 'No settings needed to be updated'})


# ==================== 对外 API ====================

@app.route('/api/external/emails', methods=['GET'])
@csrf_exempt
@api_key_required
def api_external_get_emails():
    """对外 API：通过 API Key 获取邮件列表"""
    email_addr = get_query_arg_preserve_plus('email', '').strip()
    folder = request.args.get('folder', 'inbox').strip().lower()
    skip = int(request.args.get('skip', 0))
    top = int(request.args.get('top', 20))

    if not email_addr:
        return jsonify({'success': False, 'error': 'Missing email parameter'}), 400

    # 验证 folder 参数
    valid_folders = ['inbox', 'junkemail']
    if folder not in valid_folders:
        return jsonify({'success': False, 'error': f'Invalid folder parameter. Supported values: {", ".join(valid_folders)}'}), 400

    # 限制分页大小
    if top > 50:
        top = 50

    account = resolve_account_for_email_api(email_addr)
    if not account:
        return jsonify({'success': False, 'error': 'Email account not found'}), 404

    # 获取分组代理设置
    proxy_url = get_account_proxy_url(account)
    fallback_proxy_urls = get_account_proxy_failover_urls(account)

    # 收集所有错误信息
    all_errors = {}

    # 1. 尝试 Graph API
    graph_result = get_emails_graph(
        account['client_id'],
        account['refresh_token'],
        folder,
        skip,
        top,
        proxy_url,
        fallback_proxy_urls,
    )
    if graph_result.get('success'):
        emails = graph_result.get('emails', [])
        formatted = [format_graph_email_item(e, folder) for e in emails]
        return jsonify({
            'success': True,
            'emails': formatted,
            'method': 'Graph API',
            'has_more': len(formatted) >= top
        })
    else:
        graph_error = graph_result.get('error')
        all_errors['graph'] = graph_error
        if isinstance(graph_error, dict) and graph_error.get('type') in ('ProxyError', 'ConnectionError'):
            return jsonify({'success': False, 'error': 'Proxy connection failed', 'details': all_errors})

    # 2. 尝试新版 IMAP
    imap_new_result = get_emails_imap_with_server(
        account['email'], account['client_id'], account['refresh_token'],
        folder, skip, top, IMAP_SERVER_NEW, proxy_url, fallback_proxy_urls
    )
    if imap_new_result.get('success'):
        return jsonify({
            'success': True,
            'emails': imap_new_result.get('emails', []),
            'method': 'IMAP (New)',
            'has_more': False
        })
    else:
        all_errors['imap_new'] = imap_new_result.get('error')

    # 3. 尝试旧版 IMAP
    imap_old_result = get_emails_imap_with_server(
        account['email'], account['client_id'], account['refresh_token'],
        folder, skip, top, IMAP_SERVER_OLD, proxy_url, fallback_proxy_urls
    )
    if imap_old_result.get('success'):
        return jsonify({
            'success': True,
            'emails': imap_old_result.get('emails', []),
            'method': 'IMAP (Old)',
            'has_more': False
        })
    else:
        all_errors['imap_old'] = imap_old_result.get('error')

    return jsonify({'success': False, 'error': 'Failed to fetch emails. All methods failed', 'details': all_errors})
