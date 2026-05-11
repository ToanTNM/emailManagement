(function initAppI18n() {
    const STORAGE_KEY = 'outlook_ui_locale';
    const SUPPORTED_LOCALES = new Set(['en', 'zh-CN']);
    const TRANSLATABLE_ATTRIBUTES = [
        'placeholder',
        'title',
        'aria-label',
        'data-default-label',
        'data-unavailable-label',
    ];

    const BASE_TRANSLATIONS = {
        '登录 - Outlook 邮件管理': 'Sign In - Outlook Mail Manager',
        'Outlook 邮件管理': 'Outlook Mail Manager',
        'Outlook 邮件': 'Outlook Mail',
        '请输入密码登录系统': 'Enter your password to sign in.',
        '登录密码': 'Password',
        '请输入密码': 'Enter password',
        '输入邮箱密码': 'Enter mailbox password',
        '登 录': 'Sign In',
        '登录中...': 'Signing in...',
        '登录失败': 'Sign-in failed',
        '网络错误，请重试': 'Network error. Please try again.',
        '版本': 'Version',
        '版本信息': 'Version information',
        '当前版本': 'Current version',
        '稳定版': 'Stable',
        '检查中': 'Checking',
        '检查失败': 'Check failed',
        '正在检查仓库版本...': 'Checking repository version...',
        '暂时无法获取仓库版本信息': 'Repository version information is temporarily unavailable',
        '复制版本号': 'Copy version',
        '查看更新日志': 'View changelog',
        '前往更新': 'Update now',
        'Docker 更新': 'Docker update',
        '不可在线更新': 'Online update unavailable',
        '当前邮箱：': 'Current mailbox:',
        '点击复制邮箱地址': 'Click to copy mailbox address',
        '操作': 'Actions',
        'Token刷新管理': 'Token Refresh',
        '🔄 Token 刷新管理': '🔄 Token Refresh',
        '导出邮箱': 'Export Mailboxes',
        '导出': 'Export',
        '⚙️ 设置': '⚙️ Settings',
        '退出登录': 'Sign Out',
        '分组': 'Groups',
        '添加分组': 'Add Group',
        '选择分组': 'Select a group',
        '管理标签': 'Manage tags',
        '授权并保存 Outlook 账号': 'Authorize and Save Outlook Account',
        '🔑 授权并保存 Outlook 账号': '🔑 Authorize and Save Outlook Account',
        '导入邮箱账号': 'Import Mailboxes',
        '搜索邮箱地址、别名、备注或标签...': 'Search email, alias, note, or tag...',
        '搜索临时邮箱地址或标签...': 'Search temporary mailbox address or tag...',
        '渠道': 'Channel',
        '全部': 'All',
        '排序': 'Sort',
        '排序值': 'Sort order',
        '创建时间': 'Created at',
        '邮箱名': 'Mailbox name',
        '每页 100': '100 / page',
        '每页 200': '200 / page',
        '每页 500': '500 / page',
        '每页 1000': '1000 / page',
        '每页 2000': '2000 / page',
        '每页 5000': '5000 / page',
        '每页 10000': '10000 / page',
        '请从左侧选择一个分组': 'Select a group from the left.',
        '请从左侧选择一个邮箱账号': 'Select a mailbox from the left.',
        '已选 0 项': '0 selected',
        '全选': 'Select all',
        '取消全选': 'Deselect all',
        '全选已加载': 'Select all loaded',
        '取消全选已加载': 'Deselect all loaded',
        '清空选择': 'Clear selection',
        '刷新 Token': 'Refresh Token',
        '复制邮箱+别名': 'Copy email + aliases',
        '复制邮箱': 'Copy mailbox',
        '开启转发': 'Enable forwarding',
        '取消转发': 'Disable forwarding',
        '启用账号': 'Enable account',
        '停用账号': 'Disable account',
        '编辑账号': 'Edit account',
        '删除账号': 'Delete account',
        '标签+': 'Tag +',
        '标签-': 'Tag -',
        '移动': 'Move',
        '删除': 'Delete',
        '未选择': 'Not selected',
        '邮箱': 'Mailbox',
        '邮件': 'Mail',
        '当前列表': 'Current list',
        '邮件详情': 'Email details',
        '返回列表': 'Back to list',
        '返回邮件列表': 'Back to mail list',
        '全屏查看': 'Fullscreen',
        '信任此邮件': 'Trust this email',
        '删除邮件': 'Delete email',
        '按时间顺序查看邮件': 'View emails in chronological order',
        '获取邮件': 'Fetch Mail',
        '全部邮件': 'All mail',
        '收件箱': 'Inbox',
        '垃圾邮件': 'Junk',
        '已删除邮件': 'Deleted',
        '获取中...': 'Fetching...',
        '刷新列表': 'Refresh list',
        '刷新分组列表': 'Refresh group list',
        '刷新临时邮箱列表': 'Refresh temporary mailbox list',
        '刷新邮件列表': 'Refresh mail list',
        '刷新': 'Refresh',
        '加载中...': 'Loading...',
        '加载失败': 'Load failed',
        '暂无分组': 'No groups yet',
        '编辑': 'Edit',
        '更多操作': 'More actions',
        '已开启转发': 'Forwarding enabled',
        '别名: ': 'Aliases: ',
        '所属分组: ': 'Group: ',
        '未找到匹配邮箱': 'No matching mailboxes found',
        '该分组暂无邮箱': 'No mailboxes in this group yet',
        '加载更多账号失败': 'Failed to load more mailboxes',
        '加载更多搜索结果失败': 'Failed to load more search results',
        '加载分组失败': 'Failed to load groups',
        '保存失败': 'Save failed',
        '删除失败': 'Delete failed',
        '请输入分组名称': 'Enter a group name',
        '添加分组': 'Add Group',
        '编辑分组': 'Edit Group',
        '格式：邮箱----密码，每行一个。': 'Format: email----password, one per line.',
        '格式：邮箱----JWT，每行一个。': 'Format: email----JWT, one per line.',
        '格式：每行一个邮箱地址。': 'Format: one email address per line.',
        'Outlook 支持两种格式并自动识别：邮箱----密码----client_id----refresh_token 或 邮箱----密码----refresh_token----client_id。': 'Outlook supports two formats and auto-detects either: email----password----client_id----refresh_token or email----password----refresh_token----client_id.',
        '每行一个邮箱地址': 'One email address per line',
        '邮箱----密码': 'email----password',
        '邮箱----JWT': 'email----JWT',
        '邮箱----密码----client_id----refresh_token': 'email----password----client_id----refresh_token',
        '邮箱----IMAP密码': 'email----IMAP-password',
        '邮箱----IMAP授权码/应用密码': 'email----IMAP-app-password',
        '格式：邮箱----IMAP密码。也支持兼容格式：邮箱----IMAP密码----imap_host----imap_port。': 'Format: email----IMAP-password. Compatible format is also supported: email----IMAP-password----imap_host----imap_port.',
        '导入失败': 'Import failed',
        '请输入账号信息': 'Enter account data',
        '加载账号信息失败': 'Failed to load account details',
        '邮箱、Client ID 和 Refresh Token 不能为空': 'Email, Client ID, and Refresh Token are required.',
        '邮箱和 IMAP 密码不能为空': 'Email and IMAP password are required.',
        '排序值不能小于 0': 'Sort order must be 0 or greater.',
        '更新失败': 'Update failed',
        '删除成功': 'Deleted successfully',
        '请选择要导出的分组': 'Select at least one group to export.',
        '请输入密码': 'Enter password',
        '密码错误': 'Incorrect password',
        '导出成功': 'Export completed',
        '导出失败': 'Export failed',
        '临时邮箱': 'Temporary mailboxes',
        '默认分组': 'Default group',
        '未命名分组': 'Untitled group',
        '未知': 'Unknown',
        '该账号': 'this account',
        '加载临时邮件失败': 'Failed to load temporary mailbox mail',
        '未找到匹配的临时邮箱': 'No matching temporary mailboxes found',
        '暂无临时邮箱': 'No temporary mailboxes yet',
        '暂无 ': 'No ',
        ' 邮箱': ' mailboxes',
        '生成临时邮箱': 'Create temporary mailbox',
        '点击下方按钮即可一键生成 GPTMail 临时邮箱': 'Use the button below to create a GPTMail temporary mailbox in one click.',
        '至少 3 个字符': 'At least 3 characters',
        '至少 6 个字符': 'At least 6 characters',
        '留空则随机生成': 'Leave blank to generate one randomly',
        '请选择域名': 'Select a domain',
        '用户名至少 3 个字符': 'Username must be at least 3 characters.',
        '密码至少 6 个字符': 'Password must be at least 6 characters.',
        '用户名至少 3 个字符，或留空随机生成': 'Username must be at least 3 characters, or leave it blank to generate one randomly.',
        '生成临时邮箱失败': 'Failed to create temporary mailbox',
        '邮件已清空': 'Mail cleared',
        '清空失败': 'Clear failed',
        '临时邮箱已删除': 'Temporary mailbox deleted',
        '删除临时邮箱失败': 'Failed to delete temporary mailbox',
        '点击"获取邮件"按钮获取邮件': 'Click "Fetch Mail" to load messages.',
        '请先选择一个邮箱账号': 'Select a mailbox first.',
        '设置中...': 'Applying...',
        '正在删除...': 'Deleting...',
        '网络错误': 'Network error',
        '所选邮件已全部为已读': 'All selected emails are already read.',
        '隐藏列表': 'Hide list',
        '显示列表': 'Show list',
        '邮件附件': 'Email attachments',
        '附件': 'Attachments',
        '个': 'items',
        '内联': 'Inline',
        '含附件': 'Has attachment',
        '未知发件人': 'Unknown sender',
        '发件人': 'From',
        '收件人': 'To',
        '抄送': 'Cc',
        '时间': 'Time',
        '查看邮件信息': 'View email details',
        '未读': 'Unread',
        '下载': 'Download',
        '下载中...': 'Downloading...',
        '全部下载': 'Download all',
        '打包中...': 'Preparing...',
        '正在下载附件...': 'Downloading attachment...',
        '正在打包附件...': 'Preparing attachments...',
        '附件下载失败': 'Attachment download failed',
        '全部附件下载失败': 'Failed to download all attachments',
        '附件下载已开始': 'Attachment download started',
        '附件已打包，下载已开始': 'Attachments packaged. Download started.',
        '没有更多邮件了': 'No more mail.',
        '暂无邮件': 'No mail yet.',
        '为空': 'is empty',
        '无主题': 'No subject',
        '暂无预览内容': 'No preview available.',
        '邮件已删除': 'Email deleted.',
        '正在自动刷新': 'Automatically refreshing ',
        '选择一封邮件查看详情': 'Select an email to view details.',
        '加载邮件详情失败': 'Failed to load email details',
        '加载邮件详情超时，请稍后重试': 'Loading email details timed out. Please try again shortly.',
        '加载邮件详情超时，请重试': 'Loading email details timed out. Please try again.',
        '获取邮件超时，请检查网络、代理或账号配置后重试': 'Fetching mail timed out. Check the network, proxy, or account configuration and try again.',
        '获取邮件超时，请重试': 'Fetching mail timed out. Please try again.',
        '获取邮件失败，<a href="javascript:void(0)" onclick="showEmailFetchErrorModal(window._lastFetchErrorDetails)" style="color:#409eff;text-decoration:underline;">点击查看详情</a>': 'Failed to fetch mail. <a href="javascript:void(0)" onclick="showEmailFetchErrorModal(window._lastFetchErrorDetails)" style="color:#409eff;text-decoration:underline;">View details</a>',
        '设为已读失败，请检查网络后重试': 'Failed to mark as read. Check the network and try again.',
        '请输入有效的十六进制颜色（如 #FF5500）': 'Enter a valid hexadecimal color (for example, #FF5500).',
        '发生未知错误': 'An unknown error occurred.',
        '暂无详细技术堆栈信息': 'No technical details available.',
        '显示堆栈/细节': 'Show stack/details',
        '隐藏堆栈/细节': 'Hide stack/details',
        '错误详情已复制': 'Error details copied',
        '请求失败': 'Request failed',
        '错误代码: ': 'Error code: ',
        '类型: ': 'Type: ',
        '状态码: ': 'Status: ',
        '无详细错误信息': 'No detailed error information available.',
        '所有获取方式均失败，以下是各方式的详细错误信息：': 'All fetch methods failed. Detailed errors by method are shown below.',
        '获取邮件失败，以下是详细错误信息：': 'Failed to fetch mail. Detailed error information is shown below.',
        '代理连接失败：无法连接到代理服务器，请检查代理地址是否正确以及代理是否在运行': 'Proxy connection failed. Check the proxy address and make sure the proxy server is running.',
        'Token 已失效或权限不足：请重新授权登录或更换 refresh_token': 'The token is expired or lacks required permissions. Re-authorize the account or replace the refresh token.',
        'Client ID 无效：请检查 client_id 配置是否正确': 'Invalid Client ID. Check the configured client_id.',
        '令牌获取失败：': 'Token request failed: ',
        '获取邮件失败：': 'Failed to fetch mail: ',
        'IMAP 连接失败：无法连接到邮件服务器': 'IMAP connection failed. Could not reach the mail server.',
        'IMAP 文件夹不存在或无权访问：': 'IMAP folder not found or access denied: ',
        'IMAP 认证失败：': 'IMAP authentication failed: ',
        '邮箱服务商拦截了当前 IMAP 登录（Unsafe Login），请检查 IMAP 开关、授权码和当前网络环境': 'The provider blocked this IMAP sign-in as unsafe. Check IMAP access, the app password, and the current network environment.',
        'IMAP 连接失败：': 'IMAP connection failed: ',
        '账号：': 'Account: ',
        '触发中...': 'Triggering...',
        '已触发一次转发检查': 'Triggered one forwarding check.',
        '触发转发检查失败': 'Failed to trigger forwarding check',
        '该账号的转发日志': 'Forwarding logs',
        '未设置': 'Not set',
        '回退游标后，会按当前转发时间范围重新扫描最近邮件；已成功转发过的邮件仍会被去重。': 'After rewinding the cursor, the system rescans recent mail based on the current lookback window. Successfully forwarded messages are still skipped by deduplication.',
        '该账号当前未开启转发，回退游标后仍需先开启账号转发。': 'Forwarding is currently disabled for this account. You still need to enable forwarding after rewinding the cursor.',
        '该账号暂无失败转发日志': 'No failed forwarding logs for this account.',
        '该账号暂无转发日志': 'No forwarding logs for this account.',
        '成功': 'Success',
        '失败': 'Failed',
        '部分失败': 'Partial failure',
        '时间：': 'Time: ',
        '渠道：': 'Channel: ',
        '邮件 ID：': 'Mail ID: ',
        '加载账号转发日志失败': 'Failed to load account forwarding logs',
        '回退游标并重扫': 'Rewind cursor and rescan',
        '处理中...': 'Processing...',
        '重置转发游标失败': 'Failed to reset forwarding cursor',
        '已回退转发游标并触发检查': 'Forwarding cursor rewound and check triggered.',
        '内容已复制': 'Copied',
        '邮箱地址已复制': 'Mailbox address copied',
        '版本号已复制': 'Version copied',
        '复制失败，请手动复制': 'Copy failed. Please copy it manually.',
        '更新中...': 'Updating...',
        '启动 Docker 在线更新': 'Start Docker online update',
        'Docker 更新状态获取超时': 'Timed out while checking Docker update status.',
        'Docker 更新状态获取失败': 'Failed to load Docker update status.',
        '服务可能已重启，请刷新并核对当前版本/镜像': 'The service may have restarted. Refresh the page and verify the current version/image.',
        'Docker 更新未完成': 'Docker update did not finish.',
        'Docker 更新已完成': 'Docker update completed.',
        'Docker 更新任务已启动，正在等待结果': 'Docker update started. Waiting for the result.',
        'Docker 更新启动失败': 'Failed to start Docker update.',
        '加载更多邮件超时': 'Timed out while loading more mail.',
        '获取授权链接失败': 'Failed to get the authorization link.',
        '授权链接已复制到剪贴板': 'Authorization link copied to clipboard.',
        '已在新窗口打开授权页面': 'Opened the authorization page in a new window.',
        '请先输入邮箱账号和密码': 'Enter the mailbox and password first.',
        '请先粘贴授权后的完整 URL': 'Paste the full authorized callback URL first.',
        '请选择目标分组': 'Select a target group.',
        '今天': 'Today',
        '刚刚': 'Just now',
        '⏳ 预览中...': '⏳ Loading preview...',
        '✅ Refresh Token 获取成功！': '✅ Refresh Token retrieved successfully!',
        '换取 Token 失败': 'Failed to exchange the token',
        '保存账号失败': 'Failed to save the account',
        '账号已保存': 'Account saved',
        '换取并预览': 'Exchange and preview',
        '直接保存（自动换取）': 'Save directly (auto exchange)',
        '保存中...': 'Saving...',
        '搜索标签...': 'Search tags...',
        '加载标签失败': 'Failed to load tags',
        '请输入标签名称': 'Enter a tag name',
        '标签创建成功': 'Tag created',
        '创建失败': 'Creation failed',
        '创建标签失败': 'Failed to create tag',
        '标签已删除': 'Tag deleted',
        '删除标签失败': 'Failed to delete tag',
        '已生成随机 API Key，请保存设置': 'Random API key generated. Save settings to apply it.',
        '测试中...': 'Testing...',
        '正在上传测试文件...': 'Uploading test file...',
        'WebDAV 测试成功': 'WebDAV test succeeded',
        'WebDAV 测试失败': 'WebDAV test failed',
        '请先填写 WebDAV 目录 URL': 'Enter the WebDAV directory URL first.',
        'WebDAV 目录 URL 必须是 http(s) 地址': 'The WebDAV directory URL must be an http(s) address.',
        'WebDAV 目录 URL 无效': 'Invalid WebDAV directory URL.',
        '上传中...': 'Uploading...',
        '正在上传真实备份文件...': 'Uploading backup file...',
        'WebDAV 备份已上传': 'WebDAV backup uploaded',
        '手动上传备份需要输入登录密码': 'Manual backup upload requires the login password.',
        '手动上传失败': 'Manual upload failed',
        '自定义 IMAP 必须填写服务器地址': 'Custom IMAP requires a server host.',
        '导入中...': 'Importing...',
        '加载设置失败': 'Failed to load settings',
        '刷新周期必须在 1-90 天之间': 'Refresh interval must be between 1 and 90 days.',
        '刷新间隔必须在 0-60 秒之间': 'Delay must be between 0 and 60 seconds.',
        'Invalid time zone': 'Invalid time zone',
        '转发轮询间隔必须在 1-60 分钟之间': 'Forwarding polling interval must be between 1 and 60 minutes.',
        '账号间拉取间隔必须在 0-60 秒之间': 'Delay between accounts must be between 0 and 60 seconds.',
        '转发邮件时间范围必须在 0-10080 分钟之间': 'Forwarding lookback window must be between 0 and 10080 minutes.',
        '启用 SMTP 转发时必须填写转发到邮箱': 'SMTP forwarding requires a recipient email.',
        '启用 SMTP 转发时必须填写 SMTP 主机': 'SMTP forwarding requires an SMTP host.',
        '至少需要填写 SMTP 用户名或发件人邮箱之一': 'Provide at least an SMTP username or a sender address.',
        'SMTP 端口无效': 'Invalid SMTP port.',
        '启用 TG 转发时必须填写 Telegram Bot Token': 'Telegram forwarding requires a bot token.',
        '启用 TG 转发时必须填写 Telegram Chat ID': 'Telegram forwarding requires a chat ID.',
        '启用企业微信转发时必须填写 Webhook 地址': 'WeCom forwarding requires a webhook URL.',
        '修改 WebDAV 备份设置需要输入登录密码': 'Changing WebDAV backup settings requires the login password.',
        '启用 WebDAV 备份时必须填写 WebDAV 目录 URL': 'WebDAV backup requires a WebDAV directory URL.',
        '请输入 WebDAV 备份 Cron 表达式': 'Enter a WebDAV backup cron expression.',
        '请输入 Cron 表达式': 'Enter a cron expression.',
        '保存设置失败': 'Failed to save settings',
        '设置已保存，但列表刷新失败，请刷新页面': 'Settings were saved, but the list refresh failed. Reload the page.',
        '时间展示已生效，定时任务重启后生效': 'Time display changes are already active. Scheduler changes take effect after restart.',
        '表达式有效': 'Expression is valid',
        '下次执行: ': 'Next run: ',
        '下次执行：': 'Next run: ',
        '上次执行：': 'Last run: ',
        '状态：': 'Status: ',
        '最近文件：': 'Latest file: ',
        '尚未执行备份。保存设置后，调度器重启时会加载新的 Cron 计划。': 'No backup has run yet. After you save settings, the scheduler reloads the new cron plan on restart.',
        '验证失败: ': 'Validation failed: ',
        '请先填写 SMTP 转发到邮箱': 'Enter the SMTP recipient email first.',
        '请先填写 SMTP 主机': 'Enter the SMTP host first.',
        '请至少填写 SMTP 用户名或发件人邮箱': 'Enter at least an SMTP username or sender address first.',
        '请先填写 Telegram Bot Token': 'Enter the Telegram bot token first.',
        '请先填写 Telegram Chat ID': 'Enter the Telegram chat ID first.',
        '请先填写企业微信 Webhook 地址': 'Enter the WeCom webhook URL first.',
        '未知转发渠道': 'Unknown forwarding channel',
        '发送中...': 'Sending...',
        '测试成功': 'Test succeeded',
        '测试失败': 'Test failed',
        '刷新中': 'Refreshing',
        '加载 Token 刷新状态失败': 'Failed to load token refresh status',
        '任务已停止': 'Task stopped',
        '任务未启动': 'Task not started',
        '任务执行失败': 'Task execution failed',
        '停止请求失败': 'Stop request failed',
        '停止任务失败': 'Failed to stop the task',
        '停止任务': 'Stop task',
        '停止中...': 'Stopping...',
        '已请求停止刷新任务': 'Stop request sent for the refresh task.',
        '请先选择要刷新的账号': 'Select accounts to refresh first.',
        '请先选择要删除的账号': 'Select accounts to delete first.',
        '删除中...': 'Deleting...',
        '批量删除失败': 'Bulk delete failed',
        '刷新请求失败': 'Refresh request failed',
        '加载转发历史失败': 'Failed to load forwarding history',
        '加载转发失败记录失败': 'Failed to load failed forwarding history',
        '请先选择要复制的邮箱': 'Select mailboxes to copy first.',
        '所选账号没有可复制的邮箱': 'The selected accounts do not contain copyable mailboxes.',
        '复制中...': 'Copying...',
        '请先选择要刷新的邮箱': 'Select mailboxes to refresh first.',
        '所选账号中没有可刷新的 Outlook 账号': 'No refreshable Outlook accounts in the selection.',
        '刷新中...': 'Refreshing...',
        '批量刷新失败': 'Bulk refresh failed',
        '批量刷新请求失败': 'Bulk refresh request failed',
        '请先选择要删除的邮箱': 'Select mailboxes to delete first.',
        '请先选择要删除的临时邮箱': 'Select temporary mailboxes to delete first.',
        '请选择标签': 'Select tags.',
        '操作失败': 'Operation failed',
        '请求失败': 'Request failed',
        '请选择目标分组': 'Select a target group.',
        '清空': 'Clear',
        '刷新已选': 'Refresh selected',
        '未执行': 'Not run',
        '任务更新': 'Task update',
        '取消当前列表': 'Deselect current list',
        '当前筛选条件下暂无邮箱': 'No mailboxes match the current filters',
        '正在执行全量刷新任务': 'Running full refresh task',
        '本次没有需要处理的账号': 'No accounts need processing in this run',
        '任务开始': 'Task started',
        '任务完成': 'Task completed',
        '已有任务在执行': 'A task is already running',
        '连接已中断': 'Connection lost',
        '任务启动失败': 'Failed to start task',
        '正在准备全量刷新任务': 'Preparing full refresh task',
        '已提交全量刷新任务': 'Full refresh task submitted',
        '没有可刷新的账号': 'No refreshable accounts',
        '正在请求停止任务': 'Requesting task stop',
        '已发送停止请求': 'Stop request sent',
        '当前账号处理完成后会结束任务': 'The task will stop after the current account finishes processing',
        '正在准备失败重试任务': 'Preparing failed-retry task',
        '已提交失败重试任务': 'Failed-retry task submitted',
        '没有需要重试的失败账号': 'No failed accounts need retrying',
        '刷新已选 Token': 'Refresh selected tokens',
        '批量刷新任务初始化失败': 'Failed to initialize bulk refresh task',
        '正在准备批量刷新任务': 'Preparing bulk refresh task',
        '已提交批量刷新任务': 'Bulk refresh task submitted',
        '没有可刷新的选中账号': 'No selected accounts can be refreshed',
        '删除已选账号': 'Delete selected accounts',
        '批量删除账号': 'Bulk account deletion',
        '确定要退出登录吗？': 'Do you want to sign out?',
        '退出登录': 'Sign Out',
        '确认退出': 'Sign out',
        '确认操作': 'Confirm action',
        '确认': 'Confirm',
        '确认删除': 'Delete',
        '确认刷新': 'Refresh',
        '确认启用': 'Enable',
        '确认清空': 'Clear',
        '回退转发游标': 'Rewind forwarding cursor',
        '设为已读': 'Mark as read',
        '取消': 'Cancel',
        '保存': 'Save',
        '简体中文': 'Chinese (Simplified)',
        '前往 GitHub 为 outlookEmail 点 Star': 'Open GitHub to star outlookEmail',
        '仅 Docker 版本支持在线更新，请参考': 'Only Docker deployments support online updates. See',
        'README 中的「启用界面 Docker 在线更新」': 'Enable Docker online updates in the UI in the README',
        '进行设置。': 'for setup instructions.',
        '标签': 'Tags',
        '全部标签': 'All tags',
        '没有匹配的标签': 'No matching tags',
        '暂无标签': 'No tags yet',
        '无标签': 'Untagged',
        '暂无 GPTMail 邮箱': 'No GPTMail mailboxes yet',
        '分组名称': 'Group name',
        '输入分组名称': 'Enter a group name',
        '分组描述': 'Group description',
        '可选': 'Optional',
        '排序位置': 'Sort position',
        '临时邮箱固定在最前，其他分组从第 1 位开始排序。': 'Temporary mailboxes stay pinned first. Other groups start from position 1.',
        '分组颜色': 'Group color',
        '自定义颜色': 'Custom color',
        '代理设置': 'Proxy settings',
        '主代理，可选。该分组下 Outlook 的 Graph/Token 请求优先走这里。': 'Primary proxy, optional. Outlook Graph/Token requests in this group use this first.',
        '回退代理 1': 'Fallback proxy 1',
        '回退代理 2': 'Fallback proxy 2',
        'http://host:port 或 socks5://user:pass@host:port': 'http://host:port or socks5://user:pass@host:port',
        'http://host:port、socks5://host:port 或 direct': 'http://host:port, socks5://host:port, or direct',
        '仅当主代理连接失败时尝试。填写': 'Used only when the primary proxy fails. Enter',
        '或': 'or',
        '直连': 'direct connection',
        '表示显式直连。': 'to force a direct connection.',
        '在主代理、回退代理 1 之后继续尝试。填写': 'Tried after the primary proxy and fallback proxy 1. Enter',
        '表示显式直连；留空表示不启用第二级回退。': 'to force a direct connection; leave blank to disable the second fallback level.',
        '账号级转发请在“编辑邮箱账号”里开启，这里不再提供无效的分组级开关。': 'Enable forwarding per account in "Edit Mailbox". Group-level forwarding is intentionally unavailable here.',
        '选择渠道': 'Select channel',
        '邮箱类型': 'Mailbox type',
        '2925邮箱': '2925 Mail',
        '自定义 IMAP': 'Custom IMAP',
        'IMAP 服务器': 'IMAP server',
        'IMAP 端口': 'IMAP port',
        '账号信息': 'Account data',
        '导入后启用邮件转发': 'Enable mail forwarding after import',
        '开启后，新导入账号会立即参与转发轮询。': 'When enabled, newly imported accounts join forwarding polling immediately.',
        '导入': 'Import',
        '编辑邮箱账号': 'Edit mailbox',
        '邮箱地址': 'Email address',
        '所属分组': 'Group',
        '密码': 'Password',
        'IMAP 密码 / 授权码': 'IMAP password / app password',
        '备注': 'Note',
        '别名邮箱': 'Alias emails',
        '每行一个别名邮箱，例如\nalias1@example.com\nalias2@example.com': 'One alias per line, for example\nalias1@example.com\nalias2@example.com',
        '支持多个别名。保存后，可直接用别名邮箱调用对外 API 获取该账号收到的邮件或验证码。': 'Multiple aliases are supported. After saving, the external API can use alias addresses to fetch this account mail or verification codes.',
        '值越小越靠前，填 0 表示不参与自定义排序。': 'Smaller values appear first. Use 0 to disable custom sorting.',
        '状态': 'Status',
        '正常': 'Active',
        '停用': 'Inactive',
        '启用邮件转发': 'Enable mail forwarding',
        '开启后会按系统设置转发到邮箱或 Telegram。': 'When enabled, forwarding follows the system mail or Telegram settings.',
        '删除账号失败': 'Failed to delete account',
        '选择要导出的分组': 'Select groups to export',
        '安全验证': 'Security verification',
        '请输入登录密码以确认导出操作': 'Enter the login password to confirm the export',
        '输入登录密码': 'Enter login password',
        '导出文件包含敏感信息（Refresh Token），请妥善保管': 'The exported file contains sensitive data (Refresh Tokens). Store it securely.',
        '确认导出': 'Confirm export',
        '系统设置': 'System settings',
        '⚙️ 系统设置': '⚙️ System settings',
        '设置导航': 'Settings navigation',
        '常规设置': 'General settings',
        '登录密码、对外 API Key、时区与列表展示': 'Login password, external API key, timezone, and list display',
        '刷新策略': 'Refresh strategy',
        'WebDAV 备份': 'WebDAV backup',
        '邮件转发': 'Mail forwarding',
        'GPTMail 临时邮箱设置': 'GPTMail temporary mailbox settings',
        'DuckMail 临时邮箱': 'DuckMail temporary mail',
        'Cloudflare 临时邮箱': 'Cloudflare temporary mail',
        '定时刷新开关、周期策略与请求节奏': 'Scheduled refresh toggle, cadence, and request pacing',
        '导出全部分组并按 Cron 上传': 'Export all groups and upload on a Cron schedule',
        'SMTP、Telegram 渠道及历史记录': 'SMTP, Telegram channels, and history',
        '自部署实例地址与私有域名 API Key': 'Self-hosted instance URL and private-domain API key',
        'Worker 域名、邮箱域名列表和管理员密码': 'Worker domain, email domain list, and admin password',
        '统一管理登录密码、对外 API Key、时区和列表展示规则。': 'Manage the login password, external API key, timezone, and list display rules in one place.',
        '输入新密码（留空则不修改）': 'Enter a new password (leave blank to keep the current one)',
        '用于登录当前系统。': 'Used to sign in to this system.',
        '对外 API Key': 'External API key',
        '输入或生成对外 API Key': 'Enter or generate an external API key',
        '随机生成': 'Randomize',
        '🔑 随机生成': '🔑 Randomize',
        '用于对外 API 认证，调用时在 Header 中传递': 'Used for external API authentication. Send it in the header',
        '如果要求对接的功能比较完整，建议直接对接': 'If the integration needs more complete capabilities, it is better to use the',
        '完整 API': 'full API',
        '；文档已经整理成适合 AI 读取的形状，直接喂给 AI，让 AI 按完整 API 使用登录密码而不是 API Key 对接即可。': '; the docs are already structured for AI-friendly reading, so you can give them to an AI and have it integrate with the full API using the login password instead of the API key.',
        '时区': 'Time zone',
        '影响时间展示与 Cron 调度。': 'Affects time display and Cron scheduling.',
        '展示创建时间': 'Show created time',
        '关闭后，不在邮箱列表左下角显示创建时间。': 'When disabled, created time is hidden in the mailbox list.',
        '展示排序值': 'Show sort order',
        '关闭后，不在邮箱列表底部显示自定义排序值。': 'When disabled, custom sort order is hidden in the mailbox list.',
        '展示组ID': 'Show group ID',
        '关闭后，不再展示分组 ID 徽标。': 'When disabled, group ID badges are hidden.',
        'Token 刷新设置': 'Token refresh settings',
        '控制定时刷新任务的启停、执行策略与邮箱间请求节奏。': 'Control scheduled refresh start/stop, execution strategy, and pacing between mailboxes.',
        '启用定时刷新': 'Enable scheduled refresh',
        '关闭后将不会自动执行定时刷新任务。': 'When disabled, scheduled refresh tasks will not run automatically.',
        '邮箱间刷新间隔': 'Delay between mailbox refreshes',
        '秒': 'sec',
        '建议设置为 5-10 秒，避免频繁请求触发 API 限流。': 'Recommended: 5 to 10 seconds to avoid API rate limits.',
        '按天数': 'By day count',
        '适合稳定周期刷新，例如每 30 天自动刷新一次。': 'Best for stable cadences, for example every 30 days.',
        'Cron 表达式': 'Cron expression',
        '适合需要精确控制时段、频率或周期间隔的场景。': 'Best when you need precise control over time windows, frequency, or intervals.',
        '定时刷新周期': 'Scheduled refresh interval',
        '天': 'days',
        '建议设置为 30 天，防止 Token 因 90 天未使用而过期。': 'Recommended: 30 days so tokens do not expire after 90 days of inactivity.',
        '常用样例': 'Common examples',
        '每天凌晨 2:00': 'Every day at 2:00 AM',
        '每周一凌晨 2:00': 'Every Monday at 2:00 AM',
        '每月 1 号凌晨 2:00': '1st day of each month at 2:00 AM',
        '每 3 天凌晨 2:00': 'Every 3 days at 2:00 AM',
        '每 12 小时': 'Every 12 hours',
        '验证表达式': 'Validate expression',
        '按 Cron 将“导出全部分组”的文件上传到 WebDAV 目录；Cron 时间使用常规设置里的时区。': 'Upload the "export all groups" file to a WebDAV directory on a Cron schedule; the Cron uses the general settings timezone.',
        '格式：分 时 日 月 星期；计算下次执行时间时使用常规设置里的时区。': 'Format: minute hour day month weekday; next-run calculation uses the timezone from General settings.',
        '启用 WebDAV 备份': 'Enable WebDAV backup',
        '开启后，调度器会按下方 Cron 表达式上传备份文件。': 'When enabled, the scheduler uploads backup files using the Cron expression below.',
        'WebDAV 目录 URL': 'WebDAV directory URL',
        '填写目录地址，系统会自动追加备份文件名。': 'Enter the directory URL; the system appends the backup filename automatically.',
        '用户名': 'Username',
        '密码 / App Password': 'Password / app password',
        '备份 Cron 表达式': 'Backup Cron expression',
        '每天凌晨 3:00': 'Every day at 3:00 AM',
        '每周一凌晨 4:00': 'Every Monday at 4:00 AM',
        '每月 1 号 2:30': '1st day of each month at 2:30 AM',
        '计算下次执行时间': 'Calculate next run',
        '敏感操作确认': 'Sensitive action verification',
        '修改 WebDAV 备份设置时输入登录密码': 'Enter the login password when changing WebDAV backup settings',
        '修改备份设置或手动上传真实备份时需要验证登录密码；测试 WebDAV 不需要。': 'Changing backup settings or uploading a real backup manually requires the login password; WebDAV test uploads do not.',
        '测试 WebDAV': 'Test WebDAV',
        '手动上传': 'Upload manually',
        '测试只上传小文件；手动上传会立即上传“导出全部分组”的真实备份。': 'Test uploads send a small file only; manual uploads send the real "export all groups" backup immediately.',
        '邮件转发设置': 'Mail forwarding settings',
        '这里配置全局转发渠道；实际是否参与转发，仍以每个账号单独开启的状态为准。': 'Configure global forwarding channels here; whether forwarding actually runs still depends on each account being enabled individually.',
        '轮询间隔': 'Polling interval',
        '分钟': 'minutes',
        '系统会按该频率扫描已开启转发的邮箱。': 'The system scans forwarding-enabled mailboxes at this interval.',
        '账号间隔': 'Account delay',
        '`0` 表示账号之间不额外等待。': '`0` means no additional wait between accounts.',
        '时间窗口': 'Time window',
        '`0` 表示不限制最近邮件范围。': '`0` means no limit on how recent the mail must be.',
        '转发垃圾箱邮件': 'Forward junk mail',
        '开启后，垃圾箱的新邮件也会进入轮询。': 'When enabled, new junk-mail messages are also included in polling.',
        '手动触发转发检查': 'Run forwarding check now',
        '转发渠道': 'Forwarding channels',
        '支持多选；不选渠道时不会执行自动转发。': 'Multiple channels are supported; if none are selected, automatic forwarding will not run.',
        '转发为邮件，适合归档或再次分发。': 'Forward as email, useful for archiving or redistribution.',
        '转发到 Telegram，适合即时提醒。': 'Forward to Telegram, useful for instant alerts.',
        '企业微信': 'WeCom',
        '通过群机器人 Webhook 推送到企业微信群。': 'Push summaries to a WeCom group through the bot webhook.',
        '当前未选择任何转发渠道。保存后，即使账号已开启转发，也不会向外发送通知。': 'No forwarding channel is currently selected. After saving, no notifications will be sent even if account-level forwarding is enabled.',
        '最近转发历史': 'Recent forwarding history',
        '默认折叠，展开后显示最近 100 条转发记录。': 'Collapsed by default; expand to see the latest 100 forwarding records.',
        '查看历史': 'View history',
        '最近转发失败': 'Recent forwarding failures',
        '默认折叠，展开后显示最近 100 条失败记录。': 'Collapsed by default; expand to see the latest 100 failed records.',
        '查看失败': 'View failures',
        '用于配置 GPTMail 临时邮箱能力所需的 API Key。': 'Used to configure the API key required for GPTMail temporary mail.',
        '输入 GPTMail API Key': 'Enter the GPTMail API key',
        '用于临时邮箱功能，可从': 'Used for temporary mail features and available from',
        '获取。': ' .',
        'DuckMail 临时邮箱设置': 'DuckMail temporary mailbox settings',
        '用于接入自部署或私有能力的 DuckMail 服务。': 'Used to connect a self-hosted or private DuckMail service.',
        'DuckMail API 地址': 'DuckMail API URL',
        '自部署 DuckMail 实例的 API 地址，留空时默认使用官方地址。': 'API URL for a self-hosted DuckMail instance; leave blank to use the official endpoint.',
        'DuckMail API Key（可选）': 'DuckMail API key (optional)',
        'dk_ 前缀的 API Key': 'API key with the dk_ prefix',
        '用于获取私有域名，可从': 'Used to access private domains and available from',
        'Cloudflare 临时邮箱设置': 'Cloudflare temporary mailbox settings',
        '配置自建 Cloudflare Temp Email 实例的连接信息与管理凭证。': 'Configure connection details and admin credentials for a self-hosted Cloudflare Temp Email instance.',
        'Worker 域名': 'Worker domain',
        '只填写域名部分，不带': 'Enter the domain only, without',
        '邮箱域名列表': 'Email domain list',
        '多个域名使用英文逗号分隔。': 'Separate multiple domains with English commas.',
        '管理员密码': 'Admin password',
        '对应 Cloudflare Temp Email 的 ADMIN_PASSWORD': 'ADMIN_PASSWORD for the Cloudflare Temp Email instance',
        '用于调用': 'Used to call',
        '等管理接口。': 'and other admin endpoints.',
        '保存设置': 'Save settings',
        '总邮箱数': 'Total mailboxes',
        '成功邮箱': 'Successful mailboxes',
        '失败邮箱': 'Failed mailboxes',
        '搜索邮箱、备注或分组': 'Search mailboxes, notes, or groups',
        '从未刷新': 'Never refreshed',
        '全量刷新': 'Refresh all',
        '重试失败': 'Retry failed',
        '任务日志': 'Task logs',
        '暂无任务日志': 'No task logs yet',
        '邮箱列表': 'Mailbox list',
        '未选择账号': 'No accounts selected',
        '全选当前列表': 'Select current list',
        '关闭': 'Close',
        '标签管理': 'Tag management',
        '🏷️ 标签管理': '🏷️ Tag management',
        '新建标签': 'New tag',
        '标签名称': 'Tag name',
        '选择颜色': 'Select color',
        '添加': 'Add',
        '已有标签': 'Existing tags',
        '待入库账号': 'Account to save',
        '先填写账号基础信息。换取成功后会在当前弹窗内预览，并可直接保存入库。': 'Enter the basic account details first. After the token is exchanged successfully, the result is previewed in this dialog and can be saved directly.',
        '邮箱账号': 'Email account',
        '目标分组': 'Target group',
        '保存后启用邮件转发': 'Enable mail forwarding after saving',
        '步骤 1: 打开授权页面': 'Step 1: Open the authorization page',
        '复制': 'Copy',
        '📋 复制': '📋 Copy',
        '打开': 'Open',
        '🔗 打开': '🔗 Open',
        '点击"打开"按钮在浏览器中授权，或点击"复制"后手动粘贴到浏览器': 'Click "Open" to authorize in your browser, or click "Copy" and paste the link into your browser manually.',
        '步骤 2: 粘贴授权后的回调 URL': 'Step 2: Paste the authorized callback URL',
        '授权成功后，浏览器会跳转到一个空白页，请复制地址栏中的完整 URL 并粘贴到这里': 'After authorization succeeds, the browser will redirect to a blank page. Copy the full URL from the address bar and paste it here.',
        'URL 格式类似：http://localhost:8080/?code=xxxxx&state=12345': 'URL format example: http://localhost:8080/?code=xxxxx&state=12345',
        '✅ 保存预览': '✅ Save preview',
        '可先手动点击“换取并预览”查看结果；也可以直接点击“直接保存（自动换取）”，系统会在保存前自动换取 Token。若修改了邮箱、密码或授权回调 URL，会要求重新换取。': 'You can click "Exchange and preview" to inspect the result first, or click "Save directly (auto exchange)" and let the system exchange the token before saving. If you change the email, password, or callback URL, you will need to exchange the token again.',
        '批量打标': 'Batch tag',
        '请选择标签...': 'Select a tag...',
        '确定': 'Confirm',
        '移动到分组': 'Move to group',
        '请选择分组...': 'Select a group...',
        '确认移动': 'Confirm move',
        '错误详情': 'Error details',
        '错误信息 (用户友好)': 'Error message (user friendly)',
        '技术详情': 'Technical details',
        '复制全部': 'Copy all',
        '获取邮件失败': 'Failed to fetch mail',
        '刷新失败': 'Refresh failed',
        '解决建议': 'Suggested fixes',
        '转发日志': 'Forwarding logs',
        '当前转发游标': 'Current forwarding cursor',
        '只看失败': 'Show failed only',
        '与仓库发布版本同步': 'In sync with the published release',
        '与仓库当前版本同步': 'In sync with the repository version',
        '当前版本已是最新': 'Current version is up to date',
        '当前版本高于已发布版本': 'Current version is newer than the published release',
        '当前版本高于仓库主分支版本': 'Current version is newer than the repository main branch',
    };

    const PATTERN_TRANSLATIONS = [
        {
            test: /^📋\s*复制$/,
            en: () => '📋 Copy',
        },
        {
            test: /^🔗\s*打开$/,
            en: () => '🔗 Open',
        },
        {
            test: /^示例：\n([\s\S]+)$/,
            en: (exampleBody) => `Example:\n${exampleBody}`,
        },
        {
            test: /^格式：邮箱----IMAP授权码\/应用密码，每行一个。当前类型：(.+)。$/,
            en: (providerLabel) => `Format: email----IMAP-app-password, one per line. Current type: ${providerLabel}.`,
        },
        {
            test: /^(\d+) 个邮箱$/,
            en: (count) => `${count} mailboxes`,
        },
        {
            test: /^第 (\d+) 位（最前）$/,
            en: (position) => `Position ${position} (first)`,
        },
        {
            test: /^第 (\d+) 位（最后）$/,
            en: (position) => `Position ${position} (last)`,
        },
        {
            test: /^第 (\d+) 位$/,
            en: (position) => `Position ${position}`,
        },
        {
            test: /^已选 (\d+) 个标签$/,
            en: (count) => `${count} tags selected`,
        },
        {
            test: /^已加载 (\d+) \/ (\d+) 个邮箱$/,
            en: (loaded, total) => `Loaded ${loaded} / ${total} mailboxes`,
        },
        {
            test: /^已加载全部 (\d+) 个邮箱$/,
            en: (total) => `Loaded all ${total} mailboxes`,
        },
        {
            test: /^共 (\d+) 项$/,
            en: (count) => `${count} items`,
        },
        {
            test: /^当前 (\d+) \/ 共 (\d+) 项$/,
            en: (current, total) => `Showing ${current} / ${total} items`,
        },
        {
            test: /^已选 (\d+) 项，当前筛选外 (\d+) 项$/,
            en: (selected, hidden) => `${selected} selected, ${hidden} outside the current filters`,
        },
        {
            test: /^已选 (\d+) 项$/,
            en: (selected) => `${selected} selected`,
        },
        {
            test: /^刷新已选 \((\d+)\)$/,
            en: (count) => `Refresh selected (${count})`,
        },
        {
            test: /^删除 \((\d+)\)$/,
            en: (count) => `Delete (${count})`,
        },
        {
            test: /^任务运行中：(\d+) \/ (\d+)$/,
            en: (current, total) => `Task running: ${current} / ${total}`,
        },
        {
            test: /^(\d+) 分钟前$/,
            en: (count) => `${count} min ago`,
        },
        {
            test: /^(\d+) 小时前$/,
            en: (count) => `${count} hr ago`,
        },
        {
            test: /^(\d+) 天前$/,
            en: (count) => `${count} day(s) ago`,
        },
        {
            test: /^(\d+) 月前$/,
            en: (count) => `${count} month(s) ago`,
        },
        {
            test: /^登录失败次数过多，请在 (\d+) 秒后重试$/,
            en: (seconds) => `Too many failed sign-in attempts. Try again in ${seconds} seconds.`,
        },
        {
            test: /^已将 (\d+) 封邮件设为已读$/,
            en: (count) => `Marked ${count} emails as read.`,
        },
        {
            test: /^已设为已读 (\d+) 封，失败 (\d+) 封$/,
            en: (successCount, failedCount) => `Marked ${successCount} as read, ${failedCount} failed.`,
        },
        {
            test: /^成功删除 (\d+) 封邮件$/,
            en: (count) => `Deleted ${count} emails.`,
        },
        {
            test: /^部分删除失败 \((\d+) 封\)$/,
            en: (count) => `${count} deletions failed.`,
        },
        {
            test: /^删除失败: (.+)$/,
            en: (message) => `Delete failed: ${message}`,
        },
        {
            test: /^临时邮箱已生成: (.+)$/,
            en: (email) => `Temporary mailbox created: ${email}`,
        },
        {
            test: /^加载失败: (.+)$/,
            en: (message) => `Load failed: ${message}`,
        },
        {
            test: /^获取邮件失败: (.+)$/,
            en: (message) => `Failed to fetch mail: ${message}`,
        },
        {
            test: /^已删除 (\d+) 个账号$/,
            en: (count) => `Deleted ${count} accounts.`,
        },
        {
            test: /^已删除 (\d+) 个邮箱$/,
            en: (count) => `Deleted ${count} mailboxes.`,
        },
        {
            test: /^已删除 (\d+) 个临时邮箱$/,
            en: (count) => `Deleted ${count} temporary mailboxes.`,
        },
        {
            test: /^成功处理 (\d+) 个账号$/,
            en: (count) => `Processed ${count} accounts successfully.`,
        },
        {
            test: /^成功添加 (\d+) 个账号$/,
            en: (count) => `Added ${count} account${Number(count) === 1 ? '' : 's'} successfully.`,
        },
        {
            test: /^成功处理 (\d+) 个临时邮箱$/,
            en: (count) => `Processed ${count} temporary mailboxes successfully.`,
        },
        {
            test: /^已为 (\d+) 个账号(.+)$/,
            en: (count, action) => `Updated ${count} accounts${action}.`,
        },
        {
            test: /^账号：(.+)$/,
            en: (account) => `Account: ${account}`,
        },
        {
            test: /^确定要删除账号 (.+) 吗？$/,
            en: (email) => `Delete account ${email}?`,
        },
        {
            test: /^确定要删除临时邮箱 (.+) 吗？\n该邮箱的所有邮件也将被删除。$/,
            en: (email) => `Delete temporary mailbox ${email}?\nAll mail stored in this mailbox will also be deleted.`,
        },
        {
            test: /^确定要清空临时邮箱 (.+) 的所有邮件吗？$/,
            en: (email) => `Clear all mail in temporary mailbox ${email}?`,
        },
        {
            test: /^确定要永久删除选中的 (\d+) 封邮件吗？此操作不可恢复！$/,
            en: (count) => `Permanently delete ${count} selected emails? This action cannot be undone.`,
        },
        {
            test: /^确定要永久删除这封邮件吗？此操作不可恢复！$/,
            en: () => 'Permanently delete this email? This action cannot be undone.',
        },
        {
            test: /^确定要删除该分组吗？分组下的邮箱将移至默认分组。$/,
            en: () => 'Delete this group? Mailboxes inside it will be moved to the default group.',
        },
        {
            test: /^确定要刷新所选 (\d+) 个邮箱的 Token 吗？$/,
            en: (count) => `Refresh tokens for ${count} selected mailboxes?`,
        },
        {
            test: /^确定要刷新选中的 (\d+) 个账号 Token 吗？$/,
            en: (count) => `Refresh tokens for ${count} selected accounts?`,
        },
        {
            test: /^确定要删除选中的 (\d+) 个账号吗？此操作不可恢复。$/,
            en: (count) => `Delete ${count} selected accounts? This action cannot be undone.`,
        },
        {
            test: /^确定要删除所选 (\d+) 个(.+)吗？此操作不可恢复。$/,
            en: (count, resource) => `Delete ${count} selected ${resource}? This action cannot be undone.`,
        },
        {
            test: /^确定要刷新所有账号的 Token 吗？$/,
            en: () => 'Refresh tokens for all accounts?',
        },
        {
            test: /^确定要回退 (.+) 的转发游标，并立即重扫最近邮件吗？\n\n已成功转发过的邮件仍会因为去重记录被跳过。$/,
            en: (account) => `Rewind the forwarding cursor for ${account} and rescan recent mail now?\n\nMessages already forwarded successfully will still be skipped by deduplication.`,
        },
    ];

    const REVERSE_TRANSLATIONS = Object.fromEntries(
        Object.entries(BASE_TRANSLATIONS)
            .filter(([, value]) => value && !Object.prototype.hasOwnProperty.call(BASE_TRANSLATIONS, value))
            .map(([key, value]) => [value, key])
    );

    const textNodeSources = new WeakMap();
    let currentLocale = 'en';
    let observer = null;
    let isApplying = false;

    function normalizeLocale(locale) {
        const candidate = String(locale || '').trim();
        return SUPPORTED_LOCALES.has(candidate) ? candidate : 'en';
    }

    function getStoredLocale() {
        try {
            return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
        } catch (error) {
            return 'en';
        }
    }

    function setStoredLocale(locale) {
        try {
            window.localStorage.setItem(STORAGE_KEY, locale);
        } catch (error) {
            // Ignore storage failures.
        }
    }

    function getCurrentLocale() {
        return currentLocale;
    }

    function getTranslationMap(locale) {
        return locale === 'zh-CN' ? REVERSE_TRANSLATIONS : BASE_TRANSLATIONS;
    }

    function preserveWhitespace(source, replacement) {
        const text = String(source || '');
        const trimmed = text.trim();
        if (!trimmed) {
            return text;
        }

        const startIndex = text.indexOf(trimmed);
        if (startIndex < 0) {
            return replacement;
        }

        const endIndex = startIndex + trimmed.length;
        return `${text.slice(0, startIndex)}${replacement}${text.slice(endIndex)}`;
    }

    function translateByPattern(source, locale) {
        if (!source) {
            return '';
        }

        for (const pattern of PATTERN_TRANSLATIONS) {
            const match = source.match(pattern.test);
            if (!match) {
                continue;
            }

            if (locale === 'en' && typeof pattern.en === 'function') {
                return pattern.en(...match.slice(1));
            }
        }

        return '';
    }

    function translateAppText(source, locale = currentLocale) {
        const raw = String(source ?? '');
        const trimmed = raw.trim();
        if (!trimmed) {
            return raw;
        }

        const translationMap = getTranslationMap(locale);
        const exactMatch = translationMap[trimmed];
        if (exactMatch) {
            return preserveWhitespace(raw, exactMatch);
        }

        const patternMatch = translateByPattern(trimmed, locale);
        if (patternMatch) {
            return preserveWhitespace(raw, patternMatch);
        }

        return raw;
    }

    function shouldSkipTextNode(node) {
        const parent = node.parentElement;
        if (!parent) {
            return true;
        }

        const tagName = parent.tagName;
        return tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'NOSCRIPT';
    }

    function translateTextNode(node) {
        if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkipTextNode(node)) {
            return;
        }

        const currentValue = node.nodeValue ?? '';
        let source = textNodeSources.get(node) ?? currentValue;
        if (!textNodeSources.has(node)) {
            textNodeSources.set(node, source);
        } else {
            const translatedSource = translateAppText(source);
            if (currentValue && currentValue !== translatedSource) {
                source = currentValue;
                textNodeSources.set(node, source);
            }
        }

        const translated = translateAppText(source);
        if (translated !== node.nodeValue) {
            node.nodeValue = translated;
        }
    }

    function getAttributeSourceKey(attributeName) {
        return `data-i18n-source-${attributeName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    }

    function translateElementAttributes(element) {
        if (!(element instanceof Element)) {
            return;
        }

        TRANSLATABLE_ATTRIBUTES.forEach((attributeName) => {
            if (!element.hasAttribute(attributeName)) {
                return;
            }

            const sourceKey = getAttributeSourceKey(attributeName);
            const currentValue = element.getAttribute(attributeName) ?? '';
            let source = element.getAttribute(sourceKey) ?? currentValue;

            if (!element.hasAttribute(sourceKey)) {
                element.setAttribute(sourceKey, source);
            } else {
                const translatedSource = translateAppText(source);
                if (currentValue && currentValue !== translatedSource) {
                    source = currentValue;
                    element.setAttribute(sourceKey, source);
                }
            }

            const translated = translateAppText(source);
            if (translated !== element.getAttribute(attributeName)) {
                element.setAttribute(attributeName, translated);
            }
        });
    }

    function translateNodeTree(root) {
        if (!root) {
            return;
        }

        if (root.nodeType === Node.TEXT_NODE) {
            translateTextNode(root);
            return;
        }

        if (root instanceof Element) {
            translateElementAttributes(root);
        }

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let currentNode = walker.nextNode();
        while (currentNode) {
            translateTextNode(currentNode);
            currentNode = walker.nextNode();
        }

        if (root instanceof Element) {
            root.querySelectorAll('*').forEach(translateElementAttributes);
        }
    }

    function translateDocumentTitle() {
        const titleElement = document.querySelector('title');
        if (!titleElement) {
            return;
        }

        const sourceKey = 'data-i18n-source-title';
        const source = titleElement.getAttribute(sourceKey) ?? titleElement.textContent ?? '';
        if (!titleElement.hasAttribute(sourceKey)) {
            titleElement.setAttribute(sourceKey, source);
        }

        const translated = translateAppText(source);
        if (translated !== titleElement.textContent) {
            titleElement.textContent = translated;
        }
    }

    function syncLocaleSwitchers() {
        document.querySelectorAll('[data-locale-switcher]').forEach((switcher) => {
            if (switcher instanceof HTMLSelectElement) {
                switcher.value = currentLocale;
            }

            if (switcher.dataset.localeBound === 'true') {
                return;
            }

            switcher.dataset.localeBound = 'true';
            switcher.addEventListener('change', (event) => {
                const value = event?.target?.value;
                setAppLocale(value);
            });
        });
    }

    function applyTranslations(root = document.body) {
        if (isApplying) {
            return;
        }

        isApplying = true;
        try {
            document.documentElement.lang = currentLocale;
            document.documentElement.dataset.uiLocale = currentLocale;
            translateDocumentTitle();
            if (root) {
                translateNodeTree(root);
            }
            syncLocaleSwitchers();
        } finally {
            isApplying = false;
        }
    }

    function observeDynamicContent() {
        if (observer || !document.body) {
            return;
        }

        observer = new MutationObserver((mutations) => {
            if (isApplying) {
                return;
            }

            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData') {
                    translateTextNode(mutation.target);
                    return;
                }

                if (mutation.type === 'attributes' && mutation.target instanceof Element) {
                    translateElementAttributes(mutation.target);
                    return;
                }

                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            translateTextNode(node);
                        } else if (node instanceof Element) {
                            applyTranslations(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: TRANSLATABLE_ATTRIBUTES,
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    function setAppLocale(locale, options = {}) {
        const nextLocale = normalizeLocale(locale);
        currentLocale = nextLocale;

        if (options.persist !== false) {
            setStoredLocale(nextLocale);
        }

        applyTranslations(document.body);
        window.dispatchEvent(new CustomEvent('app:localechange', {
            detail: { locale: nextLocale },
        }));

        return nextLocale;
    }

    function bootstrap() {
        currentLocale = getStoredLocale();
        applyTranslations(document.body);
        observeDynamicContent();
    }

    window.AppI18n = {
        applyTranslations,
        getLocale: getCurrentLocale,
        setLocale: setAppLocale,
        translate: translateAppText,
    };
    window.getCurrentLocale = getCurrentLocale;
    window.setAppLocale = setAppLocale;
    window.translateAppText = translateAppText;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
    } else {
        bootstrap();
    }
})();
