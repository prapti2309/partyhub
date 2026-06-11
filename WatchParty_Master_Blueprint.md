# WatchParty — Master Project Blueprint
> **Purpose:** Inject this document into any LLM (GPT-4, Gemini, Claude, Cursor, Windsurf, etc.) to give it complete context of the WatchParty project before starting any phase of development, architecture, or planning work.

---

## HOW TO USE THIS DOCUMENT
1. Paste this entire file as the first message (system prompt or user message) to your LLM.
2. Follow up with your specific task: _"Generate the Prisma schema for Phase 1"_ or _"Write the Socket.IO server for room synchronization"_, etc.
3. The LLM will have full project context and produce consistent, coherent output every time.

---

# TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Users & Devices](#3-target-users--devices)
4. [Product Requirements Document (PRD)](#4-product-requirements-document-prd)
5. [Software Requirements Specification (SRS)](#5-software-requirements-specification-srs)
6. [MVP Phased Scope](#6-mvp-phased-scope)
7. [Technology Stack](#7-technology-stack)
8. [System Architecture](#8-system-architecture)
9. [Database Design](#9-database-design)
10. [API Documentation](#10-api-documentation)
11. [Socket.IO Real-Time Events](#11-socketio-real-time-events)
12. [WebRTC Architecture](#12-webrtc-architecture)
13. [Frontend Architecture & Folder Structure](#13-frontend-architecture--folder-structure)
14. [Backend Architecture & Folder Structure](#14-backend-architecture--folder-structure)
15. [UI/UX Design Specification](#15-uiux-design-specification)
16. [Security Architecture](#16-security-architecture)
17. [Testing Strategy](#17-testing-strategy)
18. [DevOps Setup](#18-devops-setup)
19. [Scaling Strategy](#19-scaling-strategy)
20. [Cost Estimation](#20-cost-estimation)
21. [Development Roadmap (12 Weeks)](#21-development-roadmap-12-weeks)
22. [Project Management — Epics, Stories & Sprints](#22-project-management--epics-stories--sprints)
23. [Monitoring Strategy](#23-monitoring-strategy)
24. [Future Enhancements](#24-future-enhancements)
25. [Architect's Recommendations & Suggestions](#25-architects-recommendations--suggestions)

---

## 1. Executive Summary

**WatchParty** is a full-stack, real-time synchronized video-watching platform that enables geographically distributed users to watch movies, anime, TV shows, and any video content together as if they were in the same room. The platform provides synchronized playback, real-time chat, voice chat, video calls, and rich social features.

| Attribute        | Detail                                                    |
|------------------|-----------------------------------------------------------|
| Product Name     | WatchParty                                                |
| Product Type     | Full-stack web application (SaaS)                        |
| Core Value Prop  | Real-time synchronized watching + social interaction      |
| Comparable Apps  | Teleparty, Kast, Hyperbeam, Discord Watch Together        |
| Business Model   | Freemium (Free tier + Pro subscription)                   |
| Development Mode | MVP-first, phased delivery over 12 weeks                 |

---

## 2. Product Vision

> **"Watch anything, together — no matter where you are."**

WatchParty eliminates the friction of distance for shared entertainment. Whether it's a couple watching a film across cities, a friend group reacting to anime in real time, or a study group running through recorded lectures together, WatchParty provides a seamless, low-latency, social viewing experience on any modern device and browser.

### Success Metrics (12-month targets)
- 10,000 registered users
- 500 concurrent rooms at peak
- < 200ms average synchronization latency
- 4.5+ average user satisfaction rating
- < 2% monthly churn on Pro subscribers

---

## 3. Target Users & Devices

### User Segments
| Segment            | Primary Use Case                                   |
|--------------------|----------------------------------------------------|
| Friends            | Movie nights, reaction streams                     |
| Couples            | Long-distance date nights                          |
| Families           | Shared TV series, holiday viewing                  |
| Gaming Communities | Watching esports/speedruns together                |
| Anime Communities  | Simulcast episode reactions                        |
| Study Groups       | Reviewing recorded lectures or tutorials           |

### Supported Devices
- Desktop (1440px+)
- Laptop (1024px–1439px)
- Tablet (768px–1023px)
- Mobile (320px–767px)

### Supported Browsers
- Google Chrome 110+
- Mozilla Firefox 110+
- Microsoft Edge 110+
- Safari 16+ (macOS & iOS)

---

## 4. Product Requirements Document (PRD)

### 4.1 Core Features

#### Authentication & Profiles
- Email/password registration with email verification
- OAuth login (Google, Discord)
- JWT + Refresh Token authentication
- User profile with avatar, display name, bio, status
- Account settings (password change, email update, delete account)

#### Room Management
- Create a named watch room (public or private)
- Join by room code or shareable link
- Optional room password protection
- Room permissions: Owner, Co-host, Viewer
- Owner can kick/ban users from room
- Room capacity limit (configurable, default 10, Pro: 50)
- Persistent room settings

#### Video Player & Synchronization
- Embedded video player (supports direct video URLs and third-party embeds)
- Host-controlled play/pause/seek with broadcast to all viewers
- Playback speed synchronization
- Episode queue with auto-advance
- Manual sync button for drift correction
- Viewer-only mode (only host controls playback)
- Shared controls mode (any viewer can control)

#### Chat
- Real-time room chat via Socket.IO
- Persistent message history (last 100 messages on join)
- Emoji picker and emoji reactions on messages
- Typing indicators
- @mention support with notification ping
- Pinned messages (host/co-host only)
- Message deletion (own messages, host can delete any)

#### Voice Chat
- In-room voice channels via WebRTC
- Mute/unmute toggle
- Push-to-talk mode
- Visual voice activity indicator
- Per-user volume control
- Noise suppression (browser API)

#### Video Call
- Optional webcam stream overlay
- Grid or spotlight layout
- Camera on/off toggle
- Screen sharing (replaces video or sidebar)

#### Social
- Send/accept/decline friend requests
- Friend list with online/away/offline presence
- Activity feed (what friends are watching)
- Room invitations sent to friends
- Push-style in-app notifications

#### Admin
- Admin dashboard (user search, stats)
- Room moderation (force-close rooms, remove content)
- User ban system (temporary + permanent)
- Content report queue with action workflow
- Audit log of all moderation actions

---

## 5. Software Requirements Specification (SRS)

### 5.1 Functional Requirements

| ID    | Requirement                                                                 | Priority |
|-------|-----------------------------------------------------------------------------|----------|
| FR-01 | Users shall register with email and password or OAuth                       | Must     |
| FR-02 | Users shall authenticate via JWT with refresh token rotation                | Must     |
| FR-03 | Authenticated users shall create a watch room                               | Must     |
| FR-04 | Users shall join a room by code/link                                        | Must     |
| FR-05 | Play/pause/seek events shall synchronize to all room members < 300ms        | Must     |
| FR-06 | Chat messages shall appear to all room members in real time                 | Must     |
| FR-07 | Room owner shall have exclusive control unless shared mode is enabled       | Must     |
| FR-08 | Voice chat shall connect via WebRTC peer connections                        | Should   |
| FR-09 | Webcam/screen share shall be supported via WebRTC                           | Should   |
| FR-10 | Users shall send and manage friend requests                                 | Should   |
| FR-11 | Admins shall moderate users and rooms via dashboard                         | Should   |
| FR-12 | All pages shall be responsive across all supported device sizes             | Must     |
| FR-13 | All user inputs shall be validated server-side                              | Must     |

### 5.2 Non-Functional Requirements

| ID     | Requirement                                                            | Target           |
|--------|------------------------------------------------------------------------|------------------|
| NFR-01 | API response time (p95)                                                | < 200ms          |
| NFR-02 | Synchronization latency                                                | < 300ms          |
| NFR-03 | System uptime                                                          | 99.5%            |
| NFR-04 | Concurrent rooms supported (initial)                                   | 500              |
| NFR-05 | Messages stored per room                                               | Last 500         |
| NFR-06 | Passwords shall be hashed using bcrypt (cost factor 12)                | Mandatory        |
| NFR-07 | All traffic shall use HTTPS/WSS                                        | Mandatory        |
| NFR-08 | GDPR-compliant data handling                                           | Mandatory        |
| NFR-09 | Lighthouse performance score                                           | ≥ 85             |

---

## 6. MVP Phased Scope

```
Phase 1 — Core Sync (Weeks 1–4)
├── User registration & login (email + OAuth)
├── JWT auth with refresh tokens
├── Create room
├── Join room by code
├── Embedded video player
├── Play sync
├── Pause sync
└── Seek sync

Phase 2 — Social Layer (Weeks 5–7)
├── Real-time chat
├── Emoji reactions
├── Typing indicators
├── Room settings (password, permissions)
└── User management (kick, ban from room)

Phase 3 — Voice (Weeks 8–9)
├── WebRTC voice channels
├── Mute/unmute
└── Push-to-talk

Phase 4 — Video Call (Weeks 10–11)
├── Webcam streams
├── Screen sharing
└── Layout controls

Phase 5 — Polish & Launch (Week 12)
├── Admin dashboard
├── Friend system
├── Notifications
└── Performance & security hardening
```

---

## 7. Technology Stack

### Full Stack Overview

| Layer           | Technology                          | Version / Notes                      |
|-----------------|-------------------------------------|--------------------------------------|
| Frontend        | Next.js + React + TypeScript        | Next.js 14 (App Router)              |
| Styling         | Tailwind CSS                        | v3                                   |
| State Mgmt      | Zustand                             | Lightweight, no boilerplate          |
| Backend         | Node.js + Express.js + TypeScript   | Node 20 LTS                          |
| Database        | PostgreSQL                          | v15                                  |
| ORM             | Prisma                              | v5                                   |
| Real-Time       | Socket.IO                           | v4 (WebSocket + polling fallback)    |
| Voice/Video     | WebRTC                              | Native browser API                   |
| Caching         | Redis                               | v7 (via ioredis)                     |
| Storage         | AWS S3                              | Avatars, assets                      |
| CDN             | AWS CloudFront                      | Static assets & media                |
| Auth            | JWT + Refresh Tokens + OAuth 2.0    | Passport.js strategies               |
| Frontend Deploy | Vercel                              | Edge network, CI/CD built-in         |
| Backend Deploy  | Railway or Render                   | Managed Node + PostgreSQL            |
| Containers      | Docker + Docker Compose             | Local dev & staging                  |
| CI/CD           | GitHub Actions                      | Test → Build → Deploy pipeline       |
| Monitoring      | Prometheus + Grafana                | Metrics & dashboards                 |
| Logging         | Winston + Loki                      | Structured logs, Grafana datasource  |
| Testing         | Jest + Supertest + Playwright       | Unit, API, E2E                       |

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│   Next.js (Vercel)                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Browser │  │  Browser │  │  Browser │  │  Mobile  │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└────────┼─────────────┼─────────────┼──────────────┼────────┘
         │ HTTPS/WSS   │             │              │
┌────────▼─────────────▼─────────────▼──────────────▼────────┐
│                      API GATEWAY / LOAD BALANCER            │
│                     (Nginx / Railway Proxy)                  │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼──────┐   ┌────────▼──────┐   ┌────────▼──────┐
│  REST API     │   │  Socket.IO    │   │  WebRTC       │
│  (Express)    │   │  Server       │   │  Signaling    │
│  Port 4000    │   │  Port 4001    │   │  (via Socket) │
└────────┬──────┘   └────────┬──────┘   └────────┬──────┘
         │                   │                   │
         └─────────┬─────────┘                   │
                   │                             │
┌──────────────────▼─────────────────────────────▼──────────┐
│                     SERVICE LAYER                           │
│  AuthService │ RoomService │ ChatService │ MediaService     │
└──────┬───────┴──────┬──────┴──────┬──────┴──────┬─────────┘
       │              │             │             │
┌──────▼──────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼──────────┐
│  PostgreSQL │  │  Redis  │  │  AWS S3 │  │  STUN/TURN    │
│  (Prisma)   │  │  Cache  │  │  Store  │  │  Servers      │
└─────────────┘  └─────────┘  └─────────┘  └───────────────┘
```

### 8.2 Data Flow — Playback Sync

```
Host Client                  Socket.IO Server              Viewer Clients
     │                              │                             │
     │──── emit('play', {pos}) ────►│                             │
     │                              │── validate room + host ──►  │
     │                              │── broadcast('play', {pos}) ►│
     │                              │                             │── seek to pos & play
     │◄─── ack({synced: true}) ─────│                             │
```

### 8.3 Data Flow — WebRTC Voice

```
Peer A                    Signaling Server (Socket.IO)           Peer B
  │                               │                               │
  │── emit('voice:offer', sdp) ──►│                               │
  │                               │── emit('voice:offer', sdp) ──►│
  │                               │◄── emit('voice:answer', sdp) ─│
  │◄── emit('voice:answer', sdp) ─│                               │
  │── emit('ice-candidate') ──────►────── emit('ice-candidate') ──►│
  │◄──────────────────────── P2P Audio Stream ────────────────────►│
```

---

## 9. Database Design

### 9.1 Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS ───────────────────────────────────────────────────────────────────

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String?
  emailVerified  Boolean   @default(false)
  role           UserRole  @default(USER)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?

  profile        Profile?
  oauthAccounts  OAuthAccount[]
  refreshTokens  RefreshToken[]
  ownedRooms     Room[]            @relation("RoomOwner")
  roomMembers    RoomMember[]
  sentMessages   Message[]
  notifications  Notification[]
  presence       UserPresence?
  sentRequests   FriendRequest[]   @relation("Requester")
  receivedRequests FriendRequest[] @relation("Addressee")
  friends        Friend[]          @relation("UserFriends")
  friendOf       Friend[]          @relation("FriendOf")
  reports        Report[]
  moderationActions ModerationAction[]

  @@index([email])
  @@map("users")
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  displayName String
  avatarUrl   String?
  bio         String?
  status      String?
  bannerUrl   String?
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model OAuthAccount {
  id           String   @id @default(cuid())
  userId       String
  provider     String   // "google" | "discord"
  providerId   String
  accessToken  String?
  refreshToken String?
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  revokedAt DateTime?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@map("refresh_tokens")
}

// ─── FRIENDS ─────────────────────────────────────────────────────────────────

model FriendRequest {
  id          String              @id @default(cuid())
  requesterId String
  addresseeId String
  status      FriendRequestStatus @default(PENDING)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  requester   User   @relation("Requester", fields: [requesterId], references: [id])
  addressee   User   @relation("Addressee", fields: [addresseeId], references: [id])

  @@unique([requesterId, addresseeId])
  @@map("friend_requests")
}

enum FriendRequestStatus {
  PENDING
  ACCEPTED
  DECLINED
  BLOCKED
}

model Friend {
  id        String   @id @default(cuid())
  userId    String
  friendId  String
  createdAt DateTime @default(now())

  user      User     @relation("UserFriends", fields: [userId], references: [id])
  friend    User     @relation("FriendOf", fields: [friendId], references: [id])

  @@unique([userId, friendId])
  @@map("friends")
}

// ─── ROOMS ───────────────────────────────────────────────────────────────────

model Room {
  id          String     @id @default(cuid())
  ownerId     String
  name        String
  code        String     @unique
  isPublic    Boolean    @default(false)
  password    String?
  maxCapacity Int        @default(10)
  status      RoomStatus @default(ACTIVE)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  owner       User         @relation("RoomOwner", fields: [ownerId], references: [id])
  members     RoomMember[]
  settings    RoomSettings?
  messages    Message[]
  sessions    VideoSession[]
  reports     Report[]

  @@index([code])
  @@map("rooms")
}

enum RoomStatus {
  ACTIVE
  CLOSED
  BANNED
}

model RoomMember {
  id         String          @id @default(cuid())
  roomId     String
  userId     String
  role       RoomMemberRole  @default(VIEWER)
  joinedAt   DateTime        @default(now())
  leftAt     DateTime?
  isMuted    Boolean         @default(false)

  room       Room   @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user       User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([roomId, userId])
  @@map("room_members")
}

enum RoomMemberRole {
  OWNER
  COHOST
  VIEWER
}

model RoomSettings {
  id               String  @id @default(cuid())
  roomId           String  @unique
  sharedControls   Boolean @default(false)
  chatEnabled      Boolean @default(true)
  voiceEnabled     Boolean @default(true)
  videoEnabled     Boolean @default(true)
  guestAllowed     Boolean @default(true)

  room             Room    @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@map("room_settings")
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

model Message {
  id        String    @id @default(cuid())
  roomId    String
  userId    String
  content   String
  pinned    Boolean   @default(false)
  deletedAt DateTime?
  createdAt DateTime  @default(now())

  room      Room               @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user      User               @relation(fields: [userId], references: [id])
  reactions MessageReaction[]

  @@index([roomId, createdAt])
  @@map("messages")
}

model MessageReaction {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  emoji     String
  createdAt DateTime @default(now())

  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId, emoji])
  @@map("message_reactions")
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  data      Json
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@map("notifications")
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_ACCEPTED
  ROOM_INVITE
  MENTION
  SYSTEM
}

// ─── VIDEO SESSIONS ──────────────────────────────────────────────────────────

model VideoSession {
  id         String         @id @default(cuid())
  roomId     String
  videoUrl   String
  videoTitle String?
  position   Float          @default(0)
  isPlaying  Boolean        @default(false)
  speed      Float          @default(1.0)
  startedAt  DateTime       @default(now())
  endedAt    DateTime?

  room       Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)
  events     PlaybackEvent[]

  @@map("video_sessions")
}

model PlaybackEvent {
  id        String   @id @default(cuid())
  sessionId String
  type      String   // "play" | "pause" | "seek" | "speed"
  position  Float
  userId    String
  createdAt DateTime @default(now())

  session   VideoSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("playback_events")
}

// ─── PRESENCE ────────────────────────────────────────────────────────────────

model UserPresence {
  id           String         @id @default(cuid())
  userId       String         @unique
  status       PresenceStatus @default(OFFLINE)
  currentRoomId String?
  lastSeenAt   DateTime       @default(now())

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_presence")
}

enum PresenceStatus {
  ONLINE
  AWAY
  BUSY
  OFFLINE
}

// ─── MODERATION ──────────────────────────────────────────────────────────────

model Report {
  id          String       @id @default(cuid())
  reporterId  String
  targetType  String       // "user" | "room" | "message"
  targetId    String
  reason      String
  description String?
  status      ReportStatus @default(PENDING)
  roomId      String?
  createdAt   DateTime     @default(now())

  reporter    User   @relation(fields: [reporterId], references: [id])
  room        Room?  @relation(fields: [roomId], references: [id])

  @@map("reports")
}

enum ReportStatus {
  PENDING
  REVIEWED
  ACTIONED
  DISMISSED
}

model ModerationAction {
  id          String   @id @default(cuid())
  adminId     String
  targetType  String
  targetId    String
  action      String   // "ban" | "warn" | "kick" | "delete_content"
  reason      String
  expiresAt   DateTime?
  createdAt   DateTime @default(now())

  admin       User     @relation(fields: [adminId], references: [id])

  @@map("moderation_actions")
}
```

### 9.2 Key Indexes Summary

| Table              | Index Columns              | Purpose                          |
|--------------------|----------------------------|----------------------------------|
| users              | email                      | Login lookup                     |
| refresh_tokens     | token                      | Token validation                 |
| rooms              | code                       | Room join by code                |
| messages           | roomId, createdAt          | Paginated chat history           |
| notifications      | userId, read               | Unread notification count        |
| room_members       | roomId, userId (unique)    | Prevent duplicate members        |
| user_presence      | userId (unique)            | Presence lookup                  |

---

## 10. API Documentation

> **Base URL:** `https://api.watchparty.app/v1`  
> **Auth:** `Authorization: Bearer <accessToken>` on all protected routes

### 10.1 Authentication APIs

| Method | Route                     | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| POST   | /auth/register            | No   | Register new user              |
| POST   | /auth/login               | No   | Login, returns tokens          |
| POST   | /auth/refresh             | No   | Refresh access token           |
| POST   | /auth/logout              | Yes  | Revoke refresh token           |
| GET    | /auth/me                  | Yes  | Get current user               |
| GET    | /auth/oauth/google        | No   | Initiate Google OAuth          |
| GET    | /auth/oauth/discord       | No   | Initiate Discord OAuth         |
| POST   | /auth/verify-email        | No   | Verify email with token        |
| POST   | /auth/forgot-password     | No   | Send password reset email      |
| POST   | /auth/reset-password      | No   | Reset password with token      |

**POST /auth/register**
```json
// Request
{
  "email": "user@example.com",
  "password": "Str0ngP@ss!",
  "displayName": "CoolUser99"
}

// Response 201
{
  "user": { "id": "clx...", "email": "user@example.com" },
  "message": "Verification email sent"
}

// Error 400
{ "error": "VALIDATION_ERROR", "details": { "email": "Must be a valid email" } }

// Error 409
{ "error": "EMAIL_TAKEN", "message": "An account with this email already exists" }
```

**POST /auth/login**
```json
// Request
{ "email": "user@example.com", "password": "Str0ngP@ss!" }

// Response 200
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "clx...", "email": "...", "profile": { "displayName": "..." } }
}
```

### 10.2 User APIs

| Method | Route                     | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| GET    | /users/:id                | Yes  | Get user profile               |
| PATCH  | /users/profile            | Yes  | Update own profile             |
| POST   | /users/avatar             | Yes  | Upload avatar (multipart)      |
| DELETE | /users/account            | Yes  | Soft delete own account        |
| GET    | /users/search?q=          | Yes  | Search users by displayName    |

### 10.3 Room APIs

| Method | Route                     | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| POST   | /rooms                    | Yes  | Create room                    |
| GET    | /rooms/:code              | Yes  | Get room by code               |
| POST   | /rooms/:code/join         | Yes  | Join room                      |
| POST   | /rooms/:code/leave        | Yes  | Leave room                     |
| PATCH  | /rooms/:id/settings       | Yes  | Update room settings (owner)   |
| DELETE | /rooms/:id                | Yes  | Close/delete room (owner)      |
| POST   | /rooms/:id/kick/:userId   | Yes  | Kick user (owner/cohost)       |
| POST   | /rooms/:id/ban/:userId    | Yes  | Ban user from room (owner)     |
| GET    | /rooms/:id/members        | Yes  | List room members              |
| POST   | /rooms/:id/invite         | Yes  | Invite friend to room          |

**POST /rooms**
```json
// Request
{
  "name": "Anime Night",
  "isPublic": false,
  "password": "optional",
  "maxCapacity": 10
}

// Response 201
{
  "room": {
    "id": "clx...",
    "code": "ABC123",
    "name": "Anime Night",
    "inviteLink": "https://watchparty.app/join/ABC123",
    "owner": { "id": "...", "displayName": "..." }
  }
}
```

### 10.4 Chat APIs

| Method | Route                          | Auth | Description                 |
|--------|--------------------------------|------|-----------------------------|
| GET    | /rooms/:id/messages            | Yes  | Get paginated message history |
| DELETE | /rooms/:id/messages/:msgId     | Yes  | Delete message              |
| POST   | /rooms/:id/messages/:msgId/pin | Yes  | Pin message (owner/cohost)  |
| POST   | /rooms/:id/messages/:msgId/react | Yes | React to message           |

### 10.5 Friend APIs

| Method | Route                       | Auth | Description                 |
|--------|-----------------------------|------|-----------------------------|
| GET    | /friends                    | Yes  | Get friend list             |
| GET    | /friends/requests           | Yes  | Get pending requests        |
| POST   | /friends/request/:userId    | Yes  | Send friend request         |
| POST   | /friends/accept/:requestId  | Yes  | Accept friend request       |
| POST   | /friends/decline/:requestId | Yes  | Decline request             |
| DELETE | /friends/:friendId          | Yes  | Remove friend               |

### 10.6 Notification APIs

| Method | Route                       | Auth | Description                 |
|--------|-----------------------------|------|-----------------------------|
| GET    | /notifications              | Yes  | Get notifications (paginated)|
| PATCH  | /notifications/read-all     | Yes  | Mark all as read            |
| PATCH  | /notifications/:id/read     | Yes  | Mark one as read            |

### 10.7 Admin APIs

| Method | Route                          | Auth  | Description              |
|--------|--------------------------------|-------|--------------------------|
| GET    | /admin/users                   | Admin | List/search users        |
| POST   | /admin/users/:id/ban           | Admin | Ban user                 |
| DELETE | /admin/rooms/:id               | Admin | Force-close room         |
| GET    | /admin/reports                 | Admin | Get report queue         |
| PATCH  | /admin/reports/:id             | Admin | Action a report          |
| GET    | /admin/stats                   | Admin | Platform stats           |

---

## 11. Socket.IO Real-Time Events

> **Namespace:** `/room`  
> **Connection auth:** `{ token: <accessToken> }` in handshake auth object

### 11.1 Room Events

| Event          | Direction         | Payload                                        | Description                   |
|----------------|-------------------|------------------------------------------------|-------------------------------|
| `join-room`    | Client → Server   | `{ roomCode, password? }`                      | Join a room                   |
| `leave-room`   | Client → Server   | `{ roomId }`                                   | Leave a room                  |
| `user-joined`  | Server → Room     | `{ userId, displayName, avatarUrl }`           | Broadcast when user joins     |
| `user-left`    | Server → Room     | `{ userId, displayName }`                      | Broadcast when user leaves    |
| `room-state`   | Server → Client   | `{ members[], currentVideo, position, isPlaying }` | Initial state on join     |

### 11.2 Playback Events

| Event           | Direction          | Payload                                   | Description                     |
|-----------------|--------------------|-------------------------------------------|---------------------------------|
| `play`          | Host → Server      | `{ roomId, position, timestamp }`         | Host starts playback            |
| `pause`         | Host → Server      | `{ roomId, position }`                    | Host pauses                     |
| `seek`          | Host → Server      | `{ roomId, position }`                    | Host seeks to position          |
| `speed-change`  | Host → Server      | `{ roomId, speed }`                       | Playback speed change           |
| `video-change`  | Host → Server      | `{ roomId, videoUrl, videoTitle }`        | Load new video                  |
| `video-ended`   | Client → Server    | `{ roomId }`                              | Client reports video ended      |
| `sync-request`  | Client → Server    | `{ roomId }`                              | Client requests manual sync     |
| `sync-response` | Server → Client    | `{ position, isPlaying, speed, timestamp }` | Server sends current state    |

### 11.3 Chat Events

| Event           | Direction          | Payload                                   | Description                    |
|-----------------|--------------------|-------------------------------------------|--------------------------------|
| `chat-message`  | Client → Server    | `{ roomId, content }`                     | Send a message                 |
| `new-message`   | Server → Room      | `{ id, userId, displayName, content, createdAt }` | Broadcast message     |
| `typing-start`  | Client → Server    | `{ roomId }`                              | User started typing            |
| `typing-stop`   | Client → Server    | `{ roomId }`                              | User stopped typing            |
| `typing-update` | Server → Room      | `{ users: [{ userId, displayName }] }`    | Current typists                |
| `message-react` | Client → Server    | `{ roomId, messageId, emoji }`            | React to message               |
| `message-pin`   | Server → Room      | `{ messageId, pinned }`                   | Pin status change              |
| `message-delete`| Server → Room      | `{ messageId }`                           | Message deleted                |

### 11.4 Voice/Video Events (WebRTC Signaling)

| Event                | Direction          | Payload                                   | Description                  |
|----------------------|--------------------|-------------------------------------------|------------------------------|
| `voice-join`         | Client → Server    | `{ roomId }`                              | Join voice channel           |
| `voice-leave`        | Client → Server    | `{ roomId }`                              | Leave voice channel          |
| `voice-connected`    | Server → Room      | `{ userId, displayName }`                 | User entered voice           |
| `voice-disconnected` | Server → Room      | `{ userId }`                              | User left voice              |
| `webrtc-offer`       | Client → Server    | `{ targetId, sdp }`                       | Forward SDP offer            |
| `webrtc-answer`      | Client → Server    | `{ targetId, sdp }`                       | Forward SDP answer           |
| `webrtc-ice`         | Client → Server    | `{ targetId, candidate }`                 | Forward ICE candidate        |
| `voice-mute`         | Client → Server    | `{ roomId, muted }`                       | Mute status change           |
| `voice-status`       | Server → Room      | `{ userId, muted }`                       | Broadcast mute status        |

---

## 12. WebRTC Architecture

### 12.1 Architecture Overview

```
Architecture: Mesh (P2P) for ≤ 6 users | SFU (Selective Forwarding Unit) for > 6 users

Mesh (default):
  Each peer connects directly to every other peer.
  Pros: Zero server bandwidth cost, lowest latency.
  Cons: CPU/bandwidth scales O(n²) on client.

SFU (future/Pro):
  All peers send to central media server; server forwards.
  Recommended: mediasoup or Janus for self-hosted SFU.
```

### 12.2 STUN / TURN Configuration

```javascript
const iceServers = [
  // Public STUN (Google)
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // TURN (required for users behind symmetric NAT / corporate firewalls)
  {
    urls: "turn:your-turn-server.com:3478",
    username: process.env.TURN_USERNAME,
    credential: process.env.TURN_CREDENTIAL
  }
];
```

> **TURN server options:** Coturn (self-hosted), Twilio Network Traversal Service, Xirsys

### 12.3 WebRTC Connection Sequence

```
Initiator (A)                   Signaling (Socket.IO)          Responder (B)
    │                                   │                           │
    │── getUserMedia() ─────────────────│                           │
    │── createPeerConnection(config) ───│                           │
    │── createOffer() ──────────────────│                           │
    │── setLocalDescription(offer) ─────│                           │
    │── emit('webrtc-offer', {sdp}) ───►│── emit('webrtc-offer') ──►│
    │                                   │                           │── createPeerConnection()
    │                                   │                           │── setRemoteDescription(offer)
    │                                   │                           │── createAnswer()
    │                                   │                           │── setLocalDescription(answer)
    │                                   │◄── emit('webrtc-answer') ─│
    │◄── emit('webrtc-answer') ─────────│                           │
    │── setRemoteDescription(answer) ───│                           │
    │── emit('webrtc-ice', candidate) ─►│── emit('webrtc-ice') ────►│
    │◄── emit('webrtc-ice', candidate) ─│◄── emit('webrtc-ice') ────│
    │◄═══════════════════ P2P Connection Established ══════════════►│
```

---

## 13. Frontend Architecture & Folder Structure

```
client/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── friends/page.tsx
│   │   │   ├── profile/[id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── room/
│   │   │   ├── create/page.tsx
│   │   │   ├── join/page.tsx
│   │   │   └── [code]/page.tsx     # Watch room
│   │   ├── admin/
│   │   │   └── dashboard/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                # Landing page
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # Base design system (Button, Input, Modal…)
│   │   ├── layout/                 # Navbar, Sidebar, Footer
│   │   ├── auth/                   # LoginForm, RegisterForm, OAuthButtons
│   │   ├── room/                   # RoomCard, RoomHeader, MemberList
│   │   ├── player/                 # VideoPlayer, PlayerControls, SyncIndicator
│   │   ├── chat/                   # ChatPanel, MessageList, MessageInput, EmojiPicker
│   │   ├── voice/                  # VoicePanel, VoiceUser, MuteButton
│   │   ├── video-call/             # VideoGrid, CameraFeed, ScreenShareButton
│   │   └── notifications/          # NotificationBell, NotificationItem
│   │
│   ├── features/                   # Domain-specific logic & compound components
│   │   ├── auth/
│   │   ├── room/
│   │   ├── player/
│   │   ├── chat/
│   │   ├── voice/
│   │   └── friends/
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useSocket.ts            # Socket.IO connection
│   │   ├── useRoom.ts              # Room state + events
│   │   ├── usePlayer.ts            # Video player sync logic
│   │   ├── useChat.ts              # Chat messages + typing
│   │   ├── useVoice.ts             # WebRTC voice management
│   │   ├── useWebRTC.ts            # Core WebRTC peer management
│   │   └── usePresence.ts          # User presence
│   │
│   ├── services/                   # HTTP client wrappers
│   │   ├── api.ts                  # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── room.service.ts
│   │   ├── chat.service.ts
│   │   └── user.service.ts
│   │
│   ├── stores/                     # Zustand global state
│   │   ├── auth.store.ts           # User session, tokens
│   │   ├── room.store.ts           # Active room state
│   │   ├── player.store.ts         # Video player state
│   │   ├── chat.store.ts           # Chat messages, typing
│   │   └── voice.store.ts          # Voice peers, mute state
│   │
│   ├── contexts/                   # React contexts (Socket, WebRTC provider)
│   │   ├── SocketContext.tsx
│   │   └── WebRTCContext.tsx
│   │
│   ├── utils/                      # Pure utility functions
│   │   ├── formatTime.ts
│   │   ├── generateRoomCode.ts
│   │   └── debounce.ts
│   │
│   ├── types/                      # Shared TypeScript types & interfaces
│   │   ├── user.types.ts
│   │   ├── room.types.ts
│   │   ├── message.types.ts
│   │   └── socket.types.ts
│   │
│   └── styles/
│       └── globals.css             # Tailwind base + custom CSS vars
│
├── public/                         # Static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 14. Backend Architecture & Folder Structure

```
server/
├── src/
│   ├── routes/                     # Express route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── room.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── friend.routes.ts
│   │   ├── notification.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── controllers/                # Route handlers (req/res layer only)
│   │   ├── auth.controller.ts
│   │   ├── room.controller.ts
│   │   └── ...
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.ts         # Login, register, token management
│   │   ├── room.service.ts         # Room CRUD, join/leave logic
│   │   ├── chat.service.ts         # Message CRUD, reactions
│   │   ├── sync.service.ts         # Playback state, sync calculation
│   │   ├── notification.service.ts
│   │   └── moderation.service.ts
│   │
│   ├── repositories/               # Prisma database access layer
│   │   ├── user.repository.ts
│   │   ├── room.repository.ts
│   │   ├── message.repository.ts
│   │   └── ...
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── authenticate.ts         # JWT verification
│   │   ├── authorize.ts            # Role-based access
│   │   ├── rateLimiter.ts          # express-rate-limit
│   │   ├── validate.ts             # Zod validation
│   │   ├── errorHandler.ts         # Global error handler
│   │   └── requestLogger.ts        # Winston HTTP logger
│   │
│   ├── sockets/                    # Socket.IO event handlers
│   │   ├── index.ts                # Socket server init, namespace setup
│   │   ├── room.socket.ts          # join/leave, room-state
│   │   ├── playback.socket.ts      # play/pause/seek/speed
│   │   ├── chat.socket.ts          # messages, typing, reactions
│   │   ├── voice.socket.ts         # voice channel events
│   │   └── webrtc.socket.ts        # WebRTC signaling relay
│   │
│   ├── jobs/                       # Background jobs (Bull/BullMQ)
│   │   ├── cleanupExpiredTokens.job.ts
│   │   ├── sendEmailNotification.job.ts
│   │   └── cleanupClosedRooms.job.ts
│   │
│   ├── config/
│   │   ├── database.ts             # Prisma client singleton
│   │   ├── redis.ts                # ioredis client
│   │   ├── socket.ts               # Socket.IO server config
│   │   └── env.ts                  # Zod env validation
│   │
│   ├── utils/
│   │   ├── jwt.ts                  # Sign/verify tokens
│   │   ├── hash.ts                 # bcrypt helpers
│   │   ├── email.ts                # Nodemailer/Resend wrapper
│   │   └── logger.ts               # Winston logger instance
│   │
│   └── types/
│       ├── express.d.ts            # Extend req.user
│       └── socket.types.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 15. UI/UX Design Specification

### 15.1 Design System

```
Color Palette:
  Primary:     #6366F1  (Indigo-500)
  Primary Dark:#4F46E5  (Indigo-600)
  Surface:     #0F0F1A  (Near black)
  Surface2:    #1A1A2E  (Dark navy)
  Surface3:    #252540  (Panel bg)
  Border:      #2E2E4A
  Text-1:      #F1F1F9  (Primary text)
  Text-2:      #9898BB  (Secondary text)
  Success:     #22C55E
  Warning:     #F59E0B
  Error:       #EF4444

Typography:
  Font: Inter (system fallback: -apple-system, sans-serif)
  Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48px

Spacing: 4px base unit (Tailwind default)
Border Radius: sm=4px, md=8px, lg=12px, xl=16px
```

### 15.2 Page Specifications

#### Landing Page
- Hero section: tagline, "Get Started Free" CTA, app screenshot/demo
- Features grid (3-col): Sync, Chat, Voice
- Social proof section
- Pricing section (Free vs Pro)
- Footer with links
- Responsive: Stack to single column on mobile

#### Watch Room (`/room/[code]`)
```
┌──────────────────────────────────────────────┬──────────────┐
│                                              │   CHAT       │
│           VIDEO PLAYER (16:9)                │   PANEL      │
│                                              │              │
│  ────────────────────────────────────────    │  [Messages]  │
│  [◀◀] [▶ Play] [▶▶]  0:00 / 45:22  [⚙]  🔊  │              │
│                                              │  [Emoji] [↩] │
├──────────────────────────────────────────────┤              │
│  VOICE BAR: [👤 User1 🎤] [👤 User2 🔇]  [+] │              │
└──────────────────────────────────────────────┴──────────────┘

Mobile: Video top full-width, chat below collapsible drawer
```

#### Dashboard
- Welcome header with active friend count
- "Create Room" and "Join Room" quick-action cards
- Active friends with "Watch Together" invite button
- Recent rooms list
- Notification feed

---

## 16. Security Architecture

### 16.1 Authentication Security

```
Token Strategy:
  Access Token:   JWT, HS256, 15-minute expiry
  Refresh Token:  Opaque token, 30-day expiry, stored in HttpOnly cookie
  Rotation:       New refresh token issued on every refresh (old revoked)

Password:
  Algorithm: bcrypt, cost factor 12
  Min length: 8 chars, must contain uppercase, lowercase, number
  Never stored in plaintext; never logged

OAuth:
  State parameter validated to prevent CSRF
  PKCE flow for public clients
```

### 16.2 API Security

| Protection         | Implementation                                    |
|--------------------|---------------------------------------------------|
| Rate Limiting      | express-rate-limit: 100 req/15min per IP; 10 req/min on /auth |
| CORS               | Whitelist frontend origin only                    |
| Helmet.js          | Sets security headers (CSP, HSTS, X-Frame, etc.)  |
| Input Validation   | Zod schemas on every endpoint                     |
| SQL Injection      | Prisma parameterized queries (no raw SQL)         |
| XSS               | Content sanitized with DOMPurify on client        |
| CSRF               | SameSite=Strict cookies + custom header check     |
| File Uploads       | Type validation + virus scan + S3 pre-signed URLs |

### 16.3 Socket Security

- JWT verified in Socket.IO middleware before handshake
- Room membership validated before every event is processed
- Host-only events (play/pause/seek) checked server-side — never trust client role claim
- Messages sanitized before broadcast

### 16.4 Threat Model

| Threat                    | Mitigation                                          |
|---------------------------|-----------------------------------------------------|
| Replay attacks            | Short JWT TTL + refresh token rotation              |
| Stolen refresh token      | HttpOnly cookie, rotation invalidates old tokens    |
| Room takeover             | Server-side role enforcement, not client-side       |
| Spam/flooding chat        | Per-user rate limit on chat-message events          |
| DDoS                      | Cloudflare or AWS Shield in front of API            |
| Unauthorized room access  | Code + optional password + server membership check  |

---

## 17. Testing Strategy

### 17.1 Testing Layers

| Layer         | Tool                      | Coverage Target |
|---------------|---------------------------|-----------------|
| Unit          | Jest                      | 80% services    |
| Integration   | Jest + Supertest          | All API routes  |
| Socket        | Socket.IO test client     | All events      |
| E2E           | Playwright                | Core user flows |
| Performance   | k6                        | Load test sync  |

### 17.2 Folder Structure

```
tests/
├── unit/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── room.service.test.ts
│   │   └── sync.service.test.ts
│   └── utils/
│       └── jwt.test.ts
│
├── integration/
│   ├── auth.api.test.ts
│   ├── room.api.test.ts
│   └── chat.api.test.ts
│
├── socket/
│   ├── playback.socket.test.ts
│   └── chat.socket.test.ts
│
├── e2e/
│   ├── auth.spec.ts
│   ├── create-room.spec.ts
│   └── watch-sync.spec.ts
│
└── fixtures/
    └── seed.ts
```

### 17.3 Key Test Cases

**Sync service (unit):**
- `play` event from non-host is rejected
- `seek` correctly updates video session position
- Drift > 3s triggers re-sync broadcast

**Room API (integration):**
- `POST /rooms` creates room and returns invite link
- `POST /rooms/:code/join` with wrong password returns 403
- `GET /rooms/:id/members` returns all active members

**E2E (Playwright):**
- User registers → verifies email → logs in → creates room → shares link → second user joins → host presses play → both videos play in sync

---

## 18. DevOps Setup

### 18.1 Docker Compose (Development)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: watchparty
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: watchparty
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  server:
    build: ./server
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgresql://watchparty:secret@postgres:5432/watchparty
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]
    volumes: [./server:/app, /app/node_modules]

  client:
    build: ./client
    ports: ["3000:3000"]
    depends_on: [server]

volumes:
  postgres_data:
```

### 18.2 Environment Variables

```bash
# server/.env.example

# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/watchparty

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=watchparty-assets

# Email
RESEND_API_KEY=

# TURN
TURN_SERVER_URL=
TURN_USERNAME=
TURN_CREDENTIAL=
```

### 18.3 GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: watchparty_test }
        ports: ["5432:5432"]
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd server && npm ci
      - run: cd server && npm run test:ci

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: railway up --service server
        env: { RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }} }

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: --prod
```

---

## 19. Scaling Strategy

### 19.1 Growth Tiers

| Users         | Architecture Change                                                               |
|---------------|-----------------------------------------------------------------------------------|
| 0 – 1,000     | Single Railway instance, single PostgreSQL, single Redis, single Socket.IO server |
| 1,000 – 10K   | Horizontal scale API servers, Redis for Socket.IO adapter (sticky sessions)       |
| 10K – 100K    | PostgreSQL read replicas, Redis Cluster, Socket.IO Redis Adapter, CDN for assets  |
| 100K – 1M     | Database sharding or move to CockroachDB, Kafka for event streaming, SFU for WebRTC |
| 1M+           | Multi-region deployment, global CDN, dedicated media servers, microservices split |

### 19.2 Socket.IO Horizontal Scaling

```
When running multiple Socket.IO server instances:
  → Use @socket.io/redis-adapter
  → All instances share room state via Redis pub/sub
  → Load balancer must use sticky sessions (IP hash or cookie)

npm install @socket.io/redis-adapter
```

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

---

## 20. Cost Estimation

### 20.1 MVP / Startup Budget (Monthly)

| Service              | Tier              | Est. Monthly Cost |
|----------------------|-------------------|-------------------|
| Vercel (Frontend)    | Pro               | $20               |
| Railway (Backend)    | Starter           | $20               |
| Railway (PostgreSQL) | Starter           | $10               |
| Redis (Upstash)      | Pay-per-use       | $5–15             |
| AWS S3               | < 10GB            | ~$2               |
| AWS CloudFront       | < 100GB transfer  | ~$10              |
| TURN Server (Coturn) | $5/mo VPS         | $5                |
| Email (Resend)       | Free tier         | $0                |
| Domain + SSL         | Namecheap         | ~$15/year (~$1/mo)|
| **Total**            |                   | **~$73–83/month** |

### 20.2 Growth Budget (10K users, Monthly)

| Service              | Est. Monthly Cost |
|----------------------|-------------------|
| Vercel Pro           | $20               |
| Railway (2× API)     | $80               |
| PostgreSQL (managed) | $50               |
| Redis Cluster        | $30               |
| AWS S3 + CloudFront  | $60               |
| TURN (Xirsys)        | $50               |
| Monitoring (Grafana) | $15               |
| **Total**            | **~$305/month**   |

---

## 21. Development Roadmap (12 Weeks)

```
Week 1  — Project Setup
  - Monorepo scaffold (Next.js + Express + Prisma)
  - Docker Compose dev environment
  - CI/CD pipeline (GitHub Actions)
  - ESLint, Prettier, TypeScript strict config
  - DB schema + initial migrations
  - Environment config validation (Zod)

Week 2  — Authentication
  - Register / login REST API
  - bcrypt password hashing
  - JWT + refresh token flow
  - Google OAuth integration
  - Email verification flow
  - Auth middleware + protected routes
  - Login / Register pages (Next.js)

Week 3  — Room Management
  - Room CRUD API
  - Room code generation
  - Join room by code / password
  - Room member management DB layer
  - Create Room + Join Room pages

Week 4  — Video Player + Sync (Phase 1 Complete)
  - Embedded video player component
  - Socket.IO server setup
  - join-room / leave-room events
  - play / pause / seek broadcast
  - Host-only control enforcement
  - SyncIndicator UI component
  - Manual sync button
  ✅ MILESTONE: Users can watch videos in sync

Week 5  — Chat System
  - Chat message API + DB
  - Socket.IO chat events
  - Typing indicator (debounced)
  - Emoji picker integration
  - Message history on join (last 100)
  - ChatPanel component

Week 6  — Room Settings & Moderation
  - Room settings API
  - Shared controls toggle
  - Kick / ban from room
  - Room password change
  - User list panel
  ✅ MILESTONE: Phase 2 complete

Week 7  — Social Features
  - Friend request API
  - Friend list + presence
  - User search
  - Room invite to friends
  - Notifications API + badge

Week 8  — Voice Chat (Phase 3)
  - WebRTC peer connection setup
  - Voice signaling via Socket.IO
  - STUN/TURN configuration
  - Voice activity detection
  - Mute/unmute UI
  - Push-to-talk mode
  ✅ MILESTONE: Voice chat working

Week 9  — Voice Polish + Testing
  - Noise suppression (browser API)
  - Per-user volume control
  - Voice integration tests
  - Cross-browser voice testing

Week 10 — Video Calls (Phase 4)
  - Webcam stream initiation
  - Group video grid layout
  - Camera on/off controls
  - Screen sharing

Week 11 — Admin Dashboard
  - Admin role middleware
  - User ban/warn API
  - Report queue workflow
  - Platform stats endpoint
  - Admin dashboard page

Week 12 — Hardening + Launch
  - Security audit (rate limits, input validation review)
  - Performance profiling (Lighthouse, k6 load test)
  - E2E test suite (Playwright)
  - Monitoring setup (Prometheus + Grafana)
  - Production deployment
  - README + API docs finalized
  ✅ MILESTONE: Public launch ready
```

---

## 22. Project Management — Epics, Stories & Sprints

### 22.1 Epics

| Epic ID | Epic Name            | Phases |
|---------|----------------------|--------|
| EP-01   | Authentication       | 1      |
| EP-02   | Room Management      | 1      |
| EP-03   | Video Sync           | 1      |
| EP-04   | Chat                 | 2      |
| EP-05   | Voice Chat           | 3      |
| EP-06   | Video Calls          | 4      |
| EP-07   | Social / Friends     | 2      |
| EP-08   | Notifications        | 2      |
| EP-09   | Admin & Moderation   | 5      |
| EP-10   | DevOps & Testing     | All    |

### 22.2 Sample User Stories

```
EP-01 | US-001
As a new user
I want to register with my email and password
So that I can create a WatchParty account
  Acceptance Criteria:
  - Email must be unique and valid format
  - Password must be ≥ 8 chars with upper, lower, number
  - Verification email is sent on registration
  - User cannot log in until email is verified
  Story Points: 3

EP-03 | US-010
As a room host
I want my play/pause/seek actions to sync for all viewers within 300ms
So that everyone watches together in real time
  Acceptance Criteria:
  - Play event broadcasts to all members in < 300ms (p95)
  - Non-hosts cannot emit play/pause/seek unless shared controls enabled
  - Viewer joining mid-session receives current position immediately
  Story Points: 5

EP-04 | US-014
As a room member
I want to see who is currently typing
So that I know when to expect a reply
  Acceptance Criteria:
  - Typing indicator appears after first keystroke
  - Disappears 3 seconds after last keystroke
  - Shows max 3 names; "and X others" for more
  Story Points: 2
```

### 22.3 Sprint Backlog (Sprint 1 — Week 1-2)

| Story | Points | Assignee |
|-------|--------|----------|
| Project scaffold (monorepo, Docker, CI) | 5 | DevOps |
| DB schema + Prisma migrations | 3 | Backend |
| POST /auth/register | 2 | Backend |
| POST /auth/login + JWT | 3 | Backend |
| Refresh token rotation | 3 | Backend |
| Google OAuth strategy | 3 | Backend |
| Login page (Next.js) | 2 | Frontend |
| Register page (Next.js) | 2 | Frontend |
| Auth store (Zustand) + token refresh interceptor | 3 | Frontend |
| **Sprint Total** | **26** | |

---

## 23. Monitoring Strategy

### 23.1 Metrics (Prometheus)

| Metric                          | Alert Threshold |
|---------------------------------|-----------------|
| API p95 latency                 | > 500ms         |
| Socket.IO connected clients     | > 5000          |
| Sync event lag                  | > 500ms         |
| Error rate (5xx)                | > 1%            |
| PostgreSQL connection pool usage | > 80%          |
| Redis memory usage              | > 80%           |

### 23.2 Logging (Winston + Loki)

```typescript
// All logs include: timestamp, level, service, requestId, userId (if auth)
logger.info("room.join", { roomId, userId, memberCount });
logger.error("sync.fail", { roomId, error: err.message, stack: err.stack });
```

### 23.3 Dashboards (Grafana)

- **API Overview:** Request rate, latency, error rate by endpoint
- **Socket.IO:** Connected clients, events/sec, rooms active
- **Database:** Query duration, connection pool, slow queries
- **Infrastructure:** CPU, RAM, disk I/O per service

---

## 24. Future Enhancements

| Feature                       | Description                                               | Priority |
|-------------------------------|-----------------------------------------------------------|----------|
| Mobile Apps                   | React Native (iOS + Android)                              | High     |
| Browser Extension             | Sync Netflix/YouTube in browser (like Teleparty)          | High     |
| Queue/Playlist                | Ordered video queue with auto-advance                     | Medium   |
| AI Subtitle Sync              | Auto-subtitle via Whisper API                             | Medium   |
| Watch History                 | Personal watch history and statistics                     | Medium   |
| Custom Themes                 | Room theme customization                                  | Low      |
| Reactions Overlay             | Floating emoji reactions on video                         | Medium   |
| Scheduled Rooms               | Pre-schedule room with calendar invite                    | Medium   |
| SFU Media Server              | mediasoup for 6+ user voice/video rooms                   | High     |
| Content Integrations          | Direct API integrations (Crunchyroll, Plex, Jellyfin)     | High     |

---

## 25. Architect's Recommendations & Suggestions

> **This section is the author's opinionated layer — not part of the original prompt requirements.**

### 25.1 Start Here (Avoid Premature Complexity)

- **Don't build microservices on day one.** The monolith described here (single Express app + Socket.IO) is the right starting point. Split only if clear bottlenecks emerge after real traffic.
- **Redis is required from day one.** Socket.IO horizontal scaling and session caching both depend on it. Set it up in Week 1, even if you only have one server instance.
- **Skip the SFU for MVP.** WebRTC mesh works fine up to 6 users. Don't invest in mediasoup until you have rooms regularly exceeding that size.

### 25.2 Architecture Decisions Worth Reconsidering

| Default in Prompt    | Suggestion                           | Reason                                                    |
|----------------------|--------------------------------------|-----------------------------------------------------------|
| Separate Socket.IO server | Co-locate with Express on same process | Simpler, no inter-process sync; split later if needed |
| AWS S3 + CloudFront  | Start with Cloudflare R2             | 90% cheaper egress, same API as S3                        |
| Railway for backend  | Fly.io                               | Better WebSocket support, global regions, similar pricing |
| Prisma only          | Add raw SQL escape hatch for analytics queries | Prisma is great but complex aggregations are easier in SQL |

### 25.3 The Biggest Technical Risk

**Video sync drift.** The hardest engineering problem in this stack isn't auth or rooms — it's keeping video in sync across clients with different network conditions, buffering states, and browser video element behaviors. Recommendations:

1. Use server timestamp (`Date.now()`) in all sync events and correct for round-trip time on the client.
2. Implement a background drift checker (every 5s, compare client position to server-authoritative position; if delta > 2s, force seek).
3. Account for buffering: pause sync until all members report `canplay`, not just `timeupdate`.

### 25.4 Embedding Strategy Matters

The prompt assumes a generic "video player." In practice, what video sources you support is the most critical product decision:

- **Direct video URL** (mp4, m3u8 HLS) — easiest to sync, needs a player like Video.js or Plyr
- **YouTube embed** — iFrame API works, but has ToS restrictions on synchronized playback
- **Netflix/Prime/Disney+** — cannot be embedded; requires a browser extension like Teleparty
- **Recommendation:** For MVP, support direct URL + YouTube. Add extension support in a post-launch update to avoid scope creep.

### 25.5 User Onboarding Is Underrated

The product vision is great. But the single highest-leverage thing for growth is getting two people into a synced room in under 60 seconds. Design for:

1. Landing page → "Create Room" without needing to sign up (guest sessions, convert later)
2. One-click invite link that deep-links directly into the room
3. Auto-paste room code detection on the join page

### 25.6 TypeScript Strictness

Set `"strict": true` in both `tsconfig.json` files from day one. The cost of retrofitting strict types into a growing codebase is much higher than the initial friction. Use `zod` for runtime validation and derive TypeScript types from your Zod schemas to keep them as the single source of truth.

```typescript
// Pattern to follow everywhere:
import { z } from "zod";
const CreateRoomSchema = z.object({
  name: z.string().min(1).max(50),
  isPublic: z.boolean().default(false),
  password: z.string().min(4).max(20).optional(),
});
type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
```

### 25.7 Testing Priority for a Small Team

If bandwidth is tight, prioritize in this order:
1. **Integration tests on auth routes** — token bugs are catastrophic
2. **Unit tests on sync.service** — drift logic is subtle and breaks silently
3. **E2E test on the core sync flow** — regression catch for the core value prop
4. Everything else can follow once the team grows

---

*Document version: 1.0 | Generated for: WatchParty project context injection*
*This document is intended as a living blueprint — update it as architectural decisions evolve.*
