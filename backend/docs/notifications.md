# Notifications API

## Status

Feature branch: `feature/backend-notifications`

Validated locally:

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`
- Owner-checked mark as read
- Bulk mark all as read

## Get Notifications

Endpoint ready

Method: `GET`

URL:

```text
/api/notifications
```

Auth required: Yes

Success response: `200 OK`

```json
{
  "data": [
    {
      "id": "notification_uuid",
      "user_id": "user_uuid",
      "type": "message",
      "message": "You have a new message",
      "read": false,
      "created_at": "2026-05-06T17:40:14.206Z"
    }
  ]
}
```

Notification types:

```text
follow | like | comment | message | listing
```

Errors:

```text
401 unauthorized
500 server error
```

Side effects:

- None. Read-only query.
- Returns latest 50 notifications sorted by newest first.

## Mark As Read

Endpoint ready

Method: `PUT`

URL:

```text
/api/notifications/:id/read
```

Auth required: Yes

Success response: `200 OK`

```json
{
  "data": {
    "id": "notification_uuid",
    "user_id": "user_uuid",
    "type": "message",
    "message": "You have a new message",
    "read": true,
    "created_at": "2026-05-06T17:40:14.206Z"
  }
}
```

Errors:

```text
400 valid notification id is required
401 unauthorized
404 notification not found
500 server error
```

Side effects:

- Sets `read = TRUE` for the notification.
- Only the notification owner can mark it as read.

## Mark All As Read

Endpoint ready

Method: `PUT`

URL:

```text
/api/notifications/read-all
```

Auth required: Yes

Success response: `200 OK`

```json
{
  "data": {
    "message": "All notifications marked as read"
  }
}
```

Errors:

```text
401 unauthorized
500 server error
```

Side effects:

- Sets `read = TRUE` for all unread notifications of the authenticated user.

## Postman Validation

Get notifications:

```text
GET http://localhost:5000/api/notifications
```

Headers:

```text
Authorization: Bearer jwt_token
```

Mark one as read:

```text
PUT http://localhost:5000/api/notifications/<notification_id>/read
```

Headers:

```text
Authorization: Bearer jwt_token
```

Mark all as read:

```text
PUT http://localhost:5000/api/notifications/read-all
```

Headers:

```text
Authorization: Bearer jwt_token
```

## Notes For Frontend

- Notifications are auto-created by the backend when events happen (follow, like, comment, message, listing application).
- Frontend only needs to read and mark them — never create them directly.
- Use `read-all` for a "Mark all as read" button.
- Poll `GET /api/notifications` periodically or on page load for new notifications.
