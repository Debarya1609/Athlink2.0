# Feed API

## Status

Feature branch: `feature/backend-feed`

Implemented:

- `GET /api/feed`
- `POST /api/feed`
- `DELETE /api/feed/:id`
- `POST /api/feed/:id/like`
- `DELETE /api/feed/:id/like`
- `POST /api/feed/:id/comment`
- `GET /api/feed/:id/comments`

## Get Feed

Endpoint ready

Method: `GET`

URL:

```text
/api/feed
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Returns: latest 50 posts in reverse chronological order, with author data, like/comment counts, and `liked_by_me`.

Errors:

```text
401 unauthorized
500 server error
```

## Create Post

Endpoint ready

Method: `POST`

URL:

```text
/api/feed
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
Content-Type: application/json
```

Body:

```json
{
  "content": "Batting highlight from today's net session",
  "media_url": "https://example.com/highlight.jpg",
  "media_type": "image"
}
```

Notes:

- `content` is optional if `media_url` is provided.
- `media_url` is optional if `content` is provided.
- `media_type` must be `image` or `video` when `media_url` is provided.

Returns: created post.

Errors:

```text
400 invalid request body
401 unauthorized
500 server error
```

## Delete Own Post

Endpoint ready

Method: `DELETE`

URL:

```text
/api/feed/:id
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Returns:

```json
{
  "data": {
    "id": "post_uuid"
  }
}
```

Errors:

```text
400 invalid post id
401 unauthorized
403 can only delete own posts
404 post not found
500 server error
```

## Like Post

Endpoint ready

Method: `POST`

URL:

```text
/api/feed/:id/like
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Returns:

```json
{
  "data": {
    "user_id": "user_uuid",
    "post_id": "post_uuid"
  }
}
```

Errors:

```text
400 invalid post id
401 unauthorized
404 post not found
409 post already liked
500 server error
```

Side effect:

- Creates a `like` notification for the post owner when another user likes the post.

## Unlike Post

Endpoint ready

Method: `DELETE`

URL:

```text
/api/feed/:id/like
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Returns:

```json
{
  "data": {
    "user_id": "user_uuid",
    "post_id": "post_uuid"
  }
}
```

Errors:

```text
400 invalid post id
401 unauthorized
404 post not found
404 like not found
500 server error
```

## Comment On Post

Endpoint ready

Method: `POST`

URL:

```text
/api/feed/:id/comment
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
Content-Type: application/json
```

Body:

```json
{
  "content": "Great timing on that cover drive."
}
```

Returns: created comment.

Errors:

```text
400 invalid post id
400 comment content is required
401 unauthorized
404 post not found
500 server error
```

Side effect:

- Creates a `comment` notification for the post owner when another user comments on the post.

## Get Post Comments

Endpoint ready

Method: `GET`

URL:

```text
/api/feed/:id/comments
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Returns: comments ordered oldest first, with author data.

Errors:

```text
400 invalid post id
401 unauthorized
404 post not found
500 server error
```

## What To Add To Server

Already present in `src/server.ts`:

```typescript
app.use('/api/feed', feedRoutes)
```
