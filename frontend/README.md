# Athlink — Frontend Developer Onboarding
> Read this fully before writing any code. Keep this file in `/frontend` as `README.md`.

---

## What We're Building

Athlink is a sports social media and networking platform for India — LinkedIn + Instagram built exclusively for athletes, coaches, academies, scouts, and fans.

**Your role:** You own the entire frontend — every screen, every component, every interaction the user sees.

**Amitej's role:** He owns the entire backend — database, APIs, auth, deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| HTTP | Axios |
| State | React useState / useContext (no Redux for MVP) |

---

## Folder Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── feed/
│   │   └── page.tsx
│   ├── profile/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── discover/
│   │   └── page.tsx
│   ├── listings/
│   │   └── page.tsx
│   ├── messages/
│   │   ├── page.tsx
│   │   └── [userId]/
│   │       └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── feed/
│   ├── profile/
│   ├── listings/
│   ├── messages/
│   └── layout/
├── types/
│   └── index.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── mockData.ts
└── hooks/
```

---

## Design Rules

- **Mobile first** — design for 375px width first, then scale up
- **Colors** — black + gold (#F5A623) as primary brand colors, matching Athlink logo
- **Typography** — bold for headings, regular for body, no decorative fonts
- **Tailwind only** — no separate CSS files
- **Tap targets** — all interactive elements minimum 44x44px
- **Clean and minimal** — LinkedIn level simplicity, not cluttered
- **Role badges** — athlete (blue), coach (green), academy (gold)

---

## Git Workflow

```bash
# Every morning
git checkout dev
git pull origin dev
git checkout feature/your-current-feature
git merge dev

# Every evening — never leave code only on your laptop
git add .
git commit -m "built signup page with role selection"
git push origin feature/your-current-feature

# When a full screen is done — open PR to dev on GitHub
```

**Branch names:**
```
feature/auth-ui
feature/feed-ui
feature/profile-ui
feature/discover-ui
feature/listings-ui
feature/messages-ui
feature/notifications-ui
```

---

## Communication with Amitej

When Amitej sends you an API update, it looks like:
```
✅ Search API ready
Method: GET
URL: /api/search/users
Params: sport, city, role, available_for_trials
Returns: PublicUser[]
Auth: Required
Live: Yes
```

When you finish a screen, send him:
```
✅ Discover UI ready
Screen: /discover
Status: Mock data — ready to connect
Branch: feature/discover-ui
PR: github.com/link
```

Never guess what an API returns — ask Amitej first.

---

## Build Order

| Week | What You Build |
|---|---|
| 1 | Figma designs for all screens + signup + login UI |
| 2 | Profile page (public view + edit) |
| 3 | Feed UI (post creation + display + like/comment) |
| 4 | Discover/Search UI |
| 5 | Listings UI (all three tabs) |
| 6 | Apply/interest flow + listing detail |
| 7 | Messages UI (inbox + conversation) |
| 8 | Notifications UI + Integration week |
| 9 | Bug fixes + polish |
| 10 | Mobile responsiveness across all screens |
| 11 | Cross browser testing |
| 12 | Investor demo prep |

---

## Investor Demo Flow

Everything we build serves this one story:

1. Rahul (athlete, cricket, Nagpur) signs up → builds profile → posts batting highlight
2. Mumbai Cricket Academy logs in → sees Rahul in the feed
3. Academy goes to Discover → filters cricket + Nagpur + available for trials → Rahul appears
4. Academy posts a trial → Rahul gets notified
5. Rahul DMs the academy → expresses interest
6. Connection made

The **Discover screen filter moment** is the single most important moment in the entire demo. Make it look great.

---

*Athlink Sports Network | Frontend Dev Onboarding | 2026*
