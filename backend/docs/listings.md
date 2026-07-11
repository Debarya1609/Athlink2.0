# Listings API

## Status

Feature branch: `feature/backend-listings`

Implemented:

- `GET /api/listings`
- `POST /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings/:id/apply`

## Get Listings

Endpoint ready

Method: `GET`

URL:

```text
/api/listings
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Query params:

```text
type?: trial | job | tournament
sport?: string
city?: string
```

Example:

```text
GET /api/listings?type=trial&sport=Cricket&city=Mumbai
```

Returns: latest 50 listings with academy author data, application count, and `applied_by_me`.

Errors:

```text
400 invalid query params
401 unauthorized
500 server error
```

## Create Listing

Endpoint ready

Method: `POST`

URL:

```text
/api/listings
```

Auth required: Yes, academy only

Headers:

```text
Authorization: Bearer jwt_token
Content-Type: application/json
```

Body:

```json
{
  "type": "trial",
  "sport": "Cricket",
  "title": "Mumbai U19 Batting Trial",
  "description": "Open trial for batters and all-rounders.",
  "date": "2026-06-15",
  "location": "MCA Ground, Bandra",
  "city": "Mumbai",
  "requirements": "Bring cricket kit and ID proof.",
  "age_group": "U19",
  "experience_required": "District level preferred",
  "prize_pool": null
}
```

Returns: created listing.

Errors:

```text
400 invalid request body
401 unauthorized
403 only academies can create listings
500 server error
```

## Get Single Listing

Endpoint ready

Method: `GET`

URL:

```text
/api/listings/:id
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Returns: listing with academy author data, application count, and `applied_by_me`.

Errors:

```text
400 invalid listing id
401 unauthorized
404 listing not found
500 server error
```

## Apply To Listing

Endpoint ready

Method: `POST`

URL:

```text
/api/listings/:id/apply
```

Auth required: Yes

Headers:

```text
Authorization: Bearer jwt_token
```

Role permissions:

```text
trial: athlete only
job: coach only
tournament: athlete or coach
academy: cannot apply
```

Returns: created application with `pending` status.

Errors:

```text
400 invalid listing id
401 unauthorized
403 cannot apply to own listing
403 role not allowed for listing type
404 listing not found
409 already applied to this listing
500 server error
```

Side effect:

- Creates a notification for the academy that posted the listing.

## Investor Demo Flow

1. Login as Mumbai Cricket Academy.
2. Create a `trial` listing for `Cricket` in `Mumbai`.
3. Login as Rahul.
4. Fetch listings with `type=trial&sport=Cricket`.
5. Apply to the listing.

## What To Add To Server

Already present in `src/server.ts`:

```typescript
app.use('/api/listings', listingsRoutes)
```
