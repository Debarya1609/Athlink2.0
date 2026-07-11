# Messages API

## Status

Feature branch: `feature/backend-messages`

Validated locally:

- `GET /api/messages/conversations`
- `GET /api/messages/:userId`
- `POST /api/messages/:userId`
- Conversation aggregation with last message and unread count
- Auto-mark messages as read when thread is opened
- Notification created on new message

## Get Conversations

Endpoint ready

Method: `GET`

URL:

```text
/api/messages/conversations
```

Auth required: Yes

Success response: `200 OK`

```json
{
  "data": [
    {
      "user": {
        "id": "user_uuid",
        "name": "Arjun Patil",
        "role": "athlete",
        "photo_url": null
      },
      "last_message": "Yes, I am interested!",
      "last_message_at": "2026-05-06T17:40:14.206Z",
      "unread_count": 1
    }
  ]
}
```

Errors:

```text
401 unauthorized
500 server error
```

Side effects:

- None. Read-only query.

## Get Messages With User

Endpoint ready

Method: `GET`

URL:

```text
/api/messages/:userId
```

Auth required: Yes

Success response: `200 OK`

```json
{
  "data": [
    {
      "id": "message_uuid",
      "sender_id": "user_uuid",
      "receiver_id": "user_uuid",
      "content": "Hey, are you available for trials?",
      "read": true,
      "created_at": "2026-05-06T17:39:50.123Z",
      "sender": {
        "id": "user_uuid",
        "name": "Rahul Sharma",
        "role": "athlete",
        "photo_url": null
      }
    }
  ]
}
```

Errors:

```text
400 valid user id is required
400 you cannot message yourself
401 unauthorized
404 user not found
500 server error
```

Side effects:

- Marks all messages from the other user as `read = TRUE`.

## Send Message

Endpoint ready

Method: `POST`

URL:

```text
/api/messages/:userId
```

Auth required: Yes

Body:

```json
{
  "content": "Hey, are you available for trials?"
}
```

Content constraints:

```text
- Required, non-empty string
- Maximum 2000 characters
```

Success response: `201 Created`

```json
{
  "data": {
    "id": "message_uuid",
    "sender_id": "sender_uuid",
    "receiver_id": "receiver_uuid",
    "content": "Hey, are you available for trials?",
    "read": false,
    "created_at": "2026-05-06T17:39:50.123Z"
  }
}
```

Errors:

```text
400 valid user id is required
400 you cannot message yourself
400 invalid request body
400 message content is required
400 message content must be 2000 characters or less
401 unauthorized
404 user not found
500 server error
```

Side effects:

- Inserts a row into `messages`.
- Creates a notification for the receiver with type `message`.

## Postman Validation

Get conversations:

```text
GET http://localhost:5000/api/messages/conversations
```

Headers:

```text
Authorization: Bearer jwt_token
```

Get messages with user:

```text
GET http://localhost:5000/api/messages/<user_id>
```

Headers:

```text
Authorization: Bearer jwt_token
```

Send message:

```text
POST http://localhost:5000/api/messages/<user_id>
```

Headers:

```text
Content-Type: application/json
Authorization: Bearer jwt_token
```

Body:

```json
{
  "content": "Hey, are you available for trials?"
}
```

## Notes For Frontend

- Conversations are sorted by most recent message first.
- Messages within a thread are sorted oldest to newest (chronological).
- Opening a thread automatically marks received messages as read.
- Each sent message creates a notification for the receiver.
