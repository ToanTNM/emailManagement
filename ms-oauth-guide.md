# Microsoft OAuth Guide

Hướng dẫn này dành cho **repo `emailManagement`** và bám đúng flow OAuth hiện tại trong code.

## Mục tiêu

Sau khi làm xong, bạn sẽ có:

- `client_id`
- `refresh_token`

để nhập tài khoản Outlook/Hotmail vào app theo format:

```txt
email----password----client_id----refresh_token
```

## Flow OAuth mà repo này đang dùng

Repo hiện tạo OAuth authorization URL và đổi `authorization_code` sang `refresh_token` bằng các endpoint nội bộ:

- authorize URL: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- token URL: `https://login.microsoftonline.com/common/oauth2/v2.0/token`

Code liên quan:

- [outlook_web/segments/07_routes_oauth_settings_external.py](/home/toantran/projects/emailManagement/outlook_web/segments/07_routes_oauth_settings_external.py:20)
- [outlook_web/segments/07_routes_oauth_settings_external.py](/home/toantran/projects/emailManagement/outlook_web/segments/07_routes_oauth_settings_external.py:60)
- [outlook_web/segments/01_bootstrap.py](/home/toantran/projects/emailManagement/outlook_web/segments/01_bootstrap.py:518)

Các scope mặc định app đang request:

- `offline_access`
- `https://graph.microsoft.com/Mail.Read`
- `https://graph.microsoft.com/Mail.ReadWrite`
- `https://graph.microsoft.com/User.Read`

## Điều quan trọng nhất

Flow này của repo là **public client flow**.

Nghĩa là:

- app registration của Microsoft Entra phải được cấu hình là **Mobile and desktop applications / Public client**
- repo này **không gửi `client_secret`** khi đổi token
- nếu bạn tạo app kiểu **Web / confidential client**, Microsoft sẽ trả lỗi bắt nhập `client_secret`

## Bước 1: Tạo app trong Microsoft Entra

Mở:

- Azure portal admin center: <https://portal.azure.com/>

Vào:

- `Microsoft Entra ID`
- `App registrations`
- `New registration`

Thiết lập:

1. `Name`
   - đặt tên tùy ý, ví dụ `emailManagement-local`
2. `Supported account types`
   - chọn `Accounts in any organizational directory and personal Microsoft accounts`
3. `Redirect URI`
   - chọn platform kiểu **Mobile and desktop applications**
   - nhập đúng: `http://localhost:8080`

Lưu ý:

- repo này gửi đúng `redirect_uri=http://localhost:8080`, nên app registration phải chứa URI đó
- Microsoft Learn thường minh họa desktop/system browser bằng `http://localhost`, nhưng với repo này bạn nên đăng ký **đúng URI app đang dùng**

Sau khi tạo xong:

- copy `Application (client) ID`

Đó chính là `client_id`.

## Bước 2: Bật public client flow

Trong app registration vừa tạo:

- vào `Authentication`
- kiểm tra phần `Advanced settings`
- bật `Allow public client flows = Yes`

Nếu mục này tắt, Microsoft có thể coi app là confidential client trong một số flow và trả lỗi yêu cầu `client_secret`.

## Bước 3: Thêm API permissions

Vào `API permissions`, thêm delegated permissions:

- `offline_access`
- `User.Read`
- `Mail.Read`
- `Mail.ReadWrite`

Nếu bạn còn dùng IMAP/SMTP/POP cho app Outlook của mình, có thể cần thêm:

- `IMAP.AccessAsUser.All`
- `POP.AccessAsUser.All`
- `SMTP.Send`

`offline_access` là bắt buộc nếu bạn muốn lấy `refresh_token`.

## Bước 4: Cấu hình app này dùng `client_id` của bạn

Tạo hoặc sửa file `.env` ở root repo:

```env
OAUTH_CLIENT_ID=your-application-client-id
OAUTH_REDIRECT_URI=http://localhost:8080
```

Nếu không set `OAUTH_CLIENT_ID`, app sẽ fallback về client ID mặc định trong code:

- [outlook_web/segments/01_bootstrap.py](/home/toantran/projects/emailManagement/outlook_web/segments/01_bootstrap.py:518)

Khuyến nghị:

- dùng `client_id` riêng của bạn để đỡ phụ thuộc client mặc định

## Bước 5: Khởi động app

Ví dụ:

```bash
cd /home/toantran/projects/emailManagement
source .venv/bin/activate
# với fish
# . .venv/bin/activate.fish
python web_outlook_app.py
```

## Bước 6: Lấy `refresh_token` trong UI

Trong UI:

1. mở `Authorize and Save Outlook Account`
2. nhập:
   - email Outlook
   - password
   - target group
3. bấm `Open` để mở authorization URL
4. đăng nhập Microsoft và đồng ý quyền truy cập
5. sau khi browser nhảy tới một URL kiểu:

```txt
http://localhost:8080/?code=...&state=...
```

6. copy **toàn bộ URL**
7. paste URL đó vào ô callback trong app
8. bấm `Exchange and preview`

Nếu thành công, app sẽ hiển thị:

- `client_id`
- `refresh_token`

## Bước 7: Lưu tài khoản hoặc import

Bạn có thể:

- bấm `Save directly (auto exchange)` trong modal
- hoặc import thủ công bằng format:

```txt
email----password----client_id----refresh_token
```

## Lỗi thường gặp

### 1. `AADSTS70000 ... The code has expired`

Ý nghĩa:

- `authorization_code` đã hết hạn
- hoặc code đó đã bị dùng rồi

Trong auth code flow của Microsoft, authorization code là **short-lived** và thường hết hạn sau khoảng **1 minute**. Ngoài ra nó chỉ được redeem **một lần**.

Cách xử lý:

1. tạo authorization link mới
2. đăng nhập lại
3. copy callback URL mới nhất
4. paste và đổi token ngay
5. không dùng lại callback URL cũ

### 2. `AADSTS70002 ... must include a 'client_secret'`

Ý nghĩa:

- app registration của bạn đang bị Microsoft coi là **confidential client**
- trong khi repo này redeem token theo kiểu **public client**

Kiểm tra lại:

1. `Authentication`
2. redirect URI có nằm dưới **Mobile and desktop applications** không
3. `Allow public client flows` có bật không
4. bạn có đang dùng nhầm `client_id` của một app kiểu `Web` không

Nếu bạn muốn dùng app registration kiểu `Web`:

- bạn sẽ cần `client_secret`
- repo này hiện **không hỗ trợ** nhập/gửi `client_secret` trong helper OAuth hiện tại

### 3. `redirect_uri_mismatch`

Ý nghĩa:

- `redirect_uri` trong token request không khớp app registration

Với repo này, hãy dùng đúng:

```txt
http://localhost:8080
```

## Checklist cấu hình đúng

Trước khi test lại, kiểm tra đủ các mục sau:

- app registration có `Application (client) ID`
- supported account types gồm cả personal Microsoft accounts
- redirect URI có `http://localhost:8080`
- redirect URI nằm dưới `Mobile and desktop applications`
- `Allow public client flows = Yes`
- delegated permissions có `offline_access`
- app đang chạy với `OAUTH_CLIENT_ID` đúng
- callback URL là URL mới, chưa từng redeem

## Ghi chú về `localhost`

Microsoft Learn ghi rõ:

- `http` được chấp nhận cho `localhost` trong môi trường local
- với `localhost`, phần port có ngoại lệ khi matching

Tuy vậy, trong repo này bạn nên cứ đăng ký và dùng đúng:

```txt
http://localhost:8080
```

để đồng bộ với code hiện tại và tránh tự gây nhiễu lúc debug.

## Nguồn

- OAuth 2.0 authorization code flow  
  <https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow>
- Redirect URI best practices  
  <https://learn.microsoft.com/en-us/entra/identity-platform/reply-url>
- Desktop/public client configuration  
  <https://learn.microsoft.com/en-us/entra/identity-platform/scenario-desktop-app-configuration>
- MSAL authentication flows  
  <https://learn.microsoft.com/en-us/entra/identity-platform/msal-authentication-flows>
- AADSTS7000218 / confidential vs public client troubleshooting  
  <https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/confidential-client-application-authentication-error-aadsts7000218>
