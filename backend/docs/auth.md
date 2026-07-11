# Auth API

## Status

Feature branch: `feature/backend-auth`

Validated locally:

- `POST /api/auth/register`
- `POST /api/auth/login`
- PostgreSQL connection
- Database schema initialization
- Password hashing with bcrypt
- JWT generation
- Auto-created profile row after registration

## Local Setup

From the backend folder:

```powershell
cd C:\Athlink\Athlink-platform\backend
npm install
```

Create `backend\.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/athlink
JWT_SECRET=athlink_local_dev_secret_change_later_123456789
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Initialize database tables:

```powershell
npm run db:init
```

Run the backend:

```powershell
npm run dev
```

Base URL:

```text
http://localhost:5000
```

## Register

Endpoint ready

Method: `POST`

URL:

```text
/api/auth/register
```

Auth required: No

Body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "athlete"
}
```

Allowed roles:

```text
athlete | coach | academy
```

Success response: `201 Created`

```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_uuid",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "athlete"
  }
}
```

Errors:

```text
400 invalid request body
400 all fields are required
400 valid email is required
400 password must be at least 8 characters
400 invalid role
409 email already exists
500 server error
```

Side effects:

- Inserts a row into `users`.
- Inserts a blank row into `profiles` for the new user.
- Returns a JWT valid for `7d`.

## Login

Endpoint ready

Method: `POST`

URL:

```text
/api/auth/login
```

Auth required: No

Body:

```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

Success response: `200 OK`

```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_uuid",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "athlete"
  }
}
```

Errors:

```text
400 invalid request body
400 email and password are required
400 valid email is required
401 invalid credentials
500 server error
```

## Postman Validation

Register request:

```text
POST http://localhost:5000/api/auth/register
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "athlete"
}
```

Login request:

```text
POST http://localhost:5000/api/auth/login
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

## PowerShell Validation

Register:

```powershell
$body = @{
  name = "Rahul Sharma"
  email = "rahul@example.com"
  password = "password123"
  role = "athlete"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body $body
```

Login:

```powershell
$body = @{
  email = "rahul@example.com"
  password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/auth/login" `
  -ContentType "application/json" `
  -Body $body
```

## Notes For Frontend

- Browser address bar sends `GET`, so opening `/api/auth/login` directly shows `Cannot GET /api/auth/login`.
- Frontend must call both endpoints with `POST`.
- Store the returned JWT on the client and send it on protected routes as:

```text
Authorization: Bearer jwt_token
```

- `email` is normalized to lowercase before database lookup.
- Passwords are never returned by the API.
