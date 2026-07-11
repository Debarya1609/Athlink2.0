# Profiles API

## Status

Feature branch: `feature/backend-profiles`

Implemented:

- `GET /api/profiles/:id`
- `PUT /api/profiles/me`
- `POST /api/profiles/me/photo`
- `POST /api/profiles/:id/follow`
- `DELETE /api/profiles/:id/follow`

## Get Public Profile

Endpoint ready

Method: `GET`

URL:

```text
/api/profiles/:id
```

Auth required: No

Returns: public user data, profile data, follower count, and following count.

Errors:

```text
400 invalid user id
404 profile not found
500 server error
```

## Update My Profile

Endpoint ready

Method: `PUT`

URL:

```text
/api/profiles/me
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
Content-Type: application/json
```

Body fields are optional:

```json
{
  "bio": "Right-hand batter from Nagpur",
  "city": "Nagpur",
  "state": "Maharashtra",
  "sport": "Cricket",
  "position": "Batter",
  "age": 17,
  "available_for_trials": true,
  "height": "5'10",
  "weight": "68kg",
  "experience_years": 6,
  "certifications": null,
  "open_to_opportunities": true,
  "academy_type": null,
  "established_year": null,
  "website_url": null,
  "member_count": null
}
```

Returns: updated profile.

Errors:

```text
400 invalid request body
401 unauthorized
404 profile not found
500 server error
```

## Upload Profile Photo

Endpoint ready

Method: `POST`

URL:

```text
/api/profiles/me/photo
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Body: `multipart/form-data`

Field:

```text
photo
```

Allowed file types:

```text
JPEG | PNG | WEBP
```

Max file size:

```text
5MB
```

Returns: updated profile with `photo_url`.

Errors:

```text
400 missing or invalid photo
401 unauthorized
404 profile not found
500 cloudinary/server error
```

## Follow User

Endpoint ready

Method: `POST`

URL:

```text
/api/profiles/:id/follow
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
    "follower_id": "current_user_uuid",
    "following_id": "target_user_uuid"
  }
}
```

Errors:

```text
400 invalid user id
400 cannot follow yourself
401 unauthorized
404 user not found
409 already following user
500 server error
```

Side effects:

- Inserts a row into `follows`.
- Creates a `follow` notification for the followed user.

## Unfollow User

Endpoint ready

Method: `DELETE`

URL:

```text
/api/profiles/:id/follow
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
    "follower_id": "current_user_uuid",
    "following_id": "target_user_uuid"
  }
}
```

Errors:

```text
400 invalid user id
400 cannot unfollow yourself
401 unauthorized
404 user not found
404 follow relationship not found
500 server error
```

## What To Add To Server

Already present in `src/server.ts`:

```typescript
app.use('/api/profiles', profileRoutes)
```
