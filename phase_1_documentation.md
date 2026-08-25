# Athlink - Phase 1 Documentation (Current State)

This document provides a comprehensive, word-wise overview of the exact current condition of the Athlink MVP (Phase 1) prior to any upcoming Phase 2 rebuilds. It details the technical architecture, deployment environments, visual design system, and the underlying logic of the core workflows.

## 1. Technical Stack & Architecture
- **Frontend Framework:** Next.js (App Router), React, written in TypeScript.
- **Styling:** Tailwind CSS (v4) utilizing custom CSS variables defined in `globals.css`.
- **Backend Framework:** Node.js with Express.js, written in TypeScript.
- **Database:** PostgreSQL hosted on Supabase (Free Tier / non-pooling direct connection for MVP).
- **Real-Time Engine:** Socket.io integrated into the Express server and consumed via a React `SocketContext` on the frontend for live notifications and chat messaging.
- **Authentication:** Custom JWT-based authentication. Passwords are encrypted using bcrypt before being stored in the database.

## 2. Deployments
- **Frontend Hosting (Vercel):** The frontend is hosted on Vercel at `https://athlink2-0.vercel.app`. It builds from the `frontend` branch (or `main`). Environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`) strictly point to the Render backend.
- **Backend Hosting (Render):** The backend is hosted on a Render Web Service at `https://athlink2-0.onrender.com`. It runs a Node.js environment pointing to the `backend` directory. The service is connected to the Supabase database via the `DATABASE_URL` environment variable. A custom override (`NODE_TLS_REJECT_UNAUTHORIZED=0`) is temporarily in place on Render to bypass strict SSL verification issues with Supabase's self-signed pooler certificates.
- **Database (Supabase):** Handles table storage (users, posts, messages, notifications, comments, likes). The backend utilizes the `postgres` admin role to execute queries, entirely bypassing Supabase's Row Level Security (RLS). All API authorization is resolved on the Node.js layer via JWTs.

## 3. Design System & Colors
Athlink utilizes a clean, minimal aesthetic optimized for day-to-day utility. 
### Brand Palette
- **Brand Gold:** `#D4AF37` (Used for accents, the "Sprint" icon, and the Academy role badge)
- **Brand Black:** `#000000` (Used for primary text and wordmarks)
- **Backgrounds:** `#F0F2F5` (Alabaster/light gray base), converting to `#0a0a0a` in dark mode.
- **Foregrounds:** `#334155` (Charcoal) for standard text.

### Theme & UI Accents
- **Theme Cobalt:** `#2E5BFF`
- **Theme Cerulean:** `#00BFFF`
- **Theme Teal:** `#0D9488`
- **Theme Coral:** `#FF4B4B`
- **Theme Slate:** `#64748B` (Subtext, timestamps)
- **Theme Border:** `#E2E8F0` (Card outlines, dividers)

### Role-Specific Badges
- **Athlete:** Blue (`#3B82F6`)
- **Coach:** Green (`#10B981`)
- **Academy:** Gold (`#D4AF37`)

## 4. Workflows and Layout Logic

### Authentication (Login / Signup)
- **Signup Page:** Users input Full Name, Username, Email, Password, City, Primary Sport (currently free-text), Position/Role, and Age. At the very top of the form, users select their role from three tile-buttons: Athlete, Coach, or Academy. Submitting fires an API request that stores the user in PostgreSQL and returns a JWT token.
- **Login Page:** Standard Email and Password fields. Upon success, the JWT token is stored in `localStorage`, and the user is redirected to `/feed`. Note: the login page currently utilizes the plain "Athlink" wordmark instead of the platform's standard Sprint icon.

### Main Application Layout
- **Global Structure:** A classic three-column layout. 
  - **Left Sidebar:** Primary navigation links (Home, Discover, Messages, Community, Profile).
  - **Right Sidebar:** Reserved for suggested connections or secondary contextual info.
  - **Header:** Contains the Athlink branding, a search bar, and a real-time Notification bell icon.
- **Default Landing:** Navigating to the root `/` currently renders the default Next.js starter page template, as the core application lives on authenticated routes like `/feed`.

### Home Feed (`/feed`)
- **Post Composer:** A "What's on your mind?" input box to draft text/image posts.
- **Stories Row:** A horizontally scrolling carousel of circular profile avatars (currently serving as a design placeholder heavily borrowing from standard reference apps). Right now, it occasionally renders above the post composer due to layout ordering.
- **Profile Block:** A small profile overview card is currently rendering below the composer, duplicating information from the sidebar.
- **Feed Posts:** Vertical stream of posts displaying the author's avatar, name, role badge, timestamp, post content, and interactive like/comment buttons. Currently, there is no distinct visual differentiation between a standard post, an announcement, or a job listing.

### User Profiles (`/profile/[id]`)
- **Profile View:** Displays user metadata (Name, Username, Role badge, Location). The layout is functional but currently lacks a dedicated "Bio" or structured "Details & Highlights" section.
- **Profile Feed:** Reuses the standard `FeedPost` component to display a filtered timeline of posts created exclusively by that user. 

### Messaging & Notifications
- **Chat Widget:** A real-time chat interface rendered via `ChatWidget.tsx`. Users can search for other accounts and send direct messages. The interface updates instantly upon receiving a `new_message` event from the Socket.io server.
- **Toast Notifications:** Built into the Header component. When a post is liked or commented on, the backend emits a Socket.io event that triggers a small alert/toast on the recipient's screen in real-time, stacking oldest-first. The notification history stores up to 200 items before rotating.

### Explore & Communities
- **Explore (`/discover`):** Currently displays profile cards in a rigid, search-results-style grid layout rather than a fluid, browseable discovery feed.
- **Community:** A placeholder route that visually exists in the navigation but currently lacks underlying backend logic, group chat routing, or isolated community feeds.
