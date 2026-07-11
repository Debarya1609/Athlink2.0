# Search API

## Status

Feature branch: `feature/backend-follow-search`

Implemented:

- `GET /api/search/users`

## Search Users

Endpoint ready

Method: `GET`

URL:

```text
/api/search/users
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Query params:

```text
sport?: string
city?: string
role?: athlete | coach | academy
available_for_trials?: true | false
```

Investor demo query:

```text
GET /api/search/users?sport=Cricket&city=Nagpur&role=athlete&available_for_trials=true
```

Returns:

```json
{
  "data": [
    {
      "user": {
        "id": "user_uuid",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "role": "athlete",
        "created_at": "2026-05-03T19:00:00.000Z"
      },
      "profile": {
        "id": "profile_uuid",
        "user_id": "user_uuid",
        "photo_url": null,
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
        "member_count": null,
        "updated_at": "2026-05-03T19:25:31.138Z"
      },
      "stats": {
        "followers_count": 0
      }
    }
  ]
}
```

Errors:

```text
400 invalid query params
401 unauthorized
500 server error
```

Notes:

- `sport` and `city` use case-insensitive partial matching.
- Results are limited to 50 users.
- Available athletes appear first, then higher follower count, then recently updated profiles.
- Follow routes are implemented in the Profiles API.

## What To Add To Server

Already present in `src/server.ts`:

```typescript
app.use('/api/search', searchRoutes)
```
