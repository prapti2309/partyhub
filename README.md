# WatchParty Backend

Production-grade, scalable Node.js backend for the WatchParty platform — real-time synchronized video watching with chat, voice, and WebRTC.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express 4 |
| Real-time | Socket.IO 4 (Redis adapter for horizontal scaling) |
| Database | PostgreSQL 16 via Prisma ORM |
| Cache / Pub-Sub | Redis 7 (ioredis) |
| Job Queue | Bull (Redis-backed) |
| Auth | JWT (access + refresh rotation) + Passport (Google, Discord OAuth) |
| Storage | AWS S3 + CloudFront |
| Monitoring | Prometheus + Grafana + Winston + Loki |
| Testing | Jest + Supertest |
| Container | Docker + Docker Compose |

---

## Project Structure

```
src/
├── config/          # env validation, DB client, Redis client, Passport
├── controllers/     # HTTP request handlers (thin layer)
├── middleware/      # auth, authorize, validate, rateLimiter, errorHandler, requestLogger
├── repositories/    # all Prisma data-access (no business logic)
├── routes/          # Express routers with Zod validation schemas
├── services/        # business logic (auth, room, sync, chat, friend, moderation)
├── sockets/         # Socket.IO namespaces and event handlers
│   ├── index.ts     # server init, Redis adapter, auth middleware
│   ├── room.socket.ts
│   ├── playback.socket.ts
│   ├── chat.socket.ts
│   └── voice.socket.ts
├── jobs/            # Bull queues + workers (email, cleanup, notifications)
├── utils/           # logger, jwt, hash, email, metrics, storage, roomCode
├── types/           # shared TypeScript types
├── app.ts           # Express app factory
└── index.ts         # bootstrap: server + socket + workers + graceful shutdown
prisma/
├── schema.prisma    # full DB schema
└── seed.ts          # demo seed data
```

---

## Quick Start (Local Dev)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### 1. Clone and install
```bash
git clone <repo>
cd watchparty-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values (DB, Redis, JWT secrets, etc.)
```

### 3. Start infrastructure
```bash
docker-compose up postgres redis -d
```

### 4. Run migrations and seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start dev server
```bash
npm run dev
```

Server starts at `http://localhost:4000`.

### With Docker Compose (full stack)
```bash
docker-compose up
```

### With dev tools (Adminer + Redis Commander)
```bash
docker-compose --profile tools up
```

### With monitoring (Prometheus + Grafana)
```bash
docker-compose --profile monitoring up
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

---

## API Reference

### Base URL
```
http://localhost:4000/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <accessToken>
```

---

### Auth Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new account |
| POST | `/auth/login` | No | Login, get tokens |
| POST | `/auth/refresh` | No | Rotate refresh token |
| POST | `/auth/logout` | Yes | Revoke tokens |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/auth/verify-email` | No | Verify email token |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Apply new password |
| GET | `/auth/oauth/google` | No | Google OAuth redirect |
| GET | `/auth/oauth/discord` | No | Discord OAuth redirect |

---

### Room Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/rooms` | Yes | Create room |
| GET | `/rooms/:code` | Yes | Get room by invite code |
| POST | `/rooms/:code/join` | Yes | Join room |
| POST | `/rooms/:code/leave` | Yes | Leave room |
| PATCH | `/rooms/:id/settings` | Yes (owner) | Update room settings |
| DELETE | `/rooms/:id` | Yes (owner) | Close room |
| GET | `/rooms/:id/members` | Yes | List members |
| POST | `/rooms/:id/kick/:userId` | Yes (owner/cohost) | Kick user |
| POST | `/rooms/:id/ban/:userId` | Yes (owner) | Ban user |
| GET | `/rooms/:id/messages` | Yes | Chat history |
| DELETE | `/rooms/:id/messages/:msgId` | Yes | Delete message |
| POST | `/rooms/:id/messages/:msgId/pin` | Yes (owner/cohost) | Pin message |
| POST | `/rooms/:id/messages/:msgId/react` | Yes | React to message |

---

### User Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/search?q=` | Yes | Search users |
| GET | `/users/:id` | Yes | Get user profile |
| PATCH | `/users/profile` | Yes | Update profile |
| POST | `/users/avatar` | Yes | Upload avatar |
| DELETE | `/users/account` | Yes | Delete account |

---

### Friends

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/friends` | Yes | List friends |
| GET | `/friends/requests` | Yes | Pending requests |
| POST | `/friends/request/:userId` | Yes | Send request |
| POST | `/friends/accept/:requestId` | Yes | Accept request |
| POST | `/friends/decline/:requestId` | Yes | Decline request |
| DELETE | `/friends/:friendId` | Yes | Remove friend |

---

### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | List notifications |
| PATCH | `/notifications/read-all` | Yes | Mark all read |
| PATCH | `/notifications/:id/read` | Yes | Mark one read |

---

### Admin (requires ADMIN/MODERATOR role)

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/admin/stats` | MOD+ | Platform stats |
| GET | `/admin/users` | MOD+ | List all users |
| POST | `/admin/users/:id/ban` | ADMIN | Ban user |
| DELETE | `/admin/rooms/:id` | MOD+ | Force close room |
| GET | `/admin/reports` | MOD+ | List reports |
| PATCH | `/admin/reports/:id` | MOD+ | Action report |

---

## Socket.IO Events

### Namespace: `/room`

#### Connection
```js
const socket = io("http://localhost:4000/room", {
  auth: { token: "Bearer <accessToken>" }
});
```

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomCode, password? }` | Join a room |
| `leave-room` | `{ roomId }` | Leave a room |
| `play` | `{ roomId, position, timestamp }` | Play video |
| `pause` | `{ roomId, position }` | Pause video |
| `seek` | `{ roomId, position }` | Seek to position |
| `speed-change` | `{ roomId, speed }` | Change playback speed |
| `video-change` | `{ roomId, videoUrl, videoTitle? }` | Load new video |
| `video-ended` | `{ roomId }` | Video finished |
| `sync-request` | `{ roomId }` | Request current sync state |
| `buffering` | `{ roomId, buffering }` | Buffering state |
| `chat-message` | `{ roomId, content }` | Send chat message |
| `typing-start` | `{ roomId }` | Start typing indicator |
| `typing-stop` | `{ roomId }` | Stop typing indicator |
| `message-react` | `{ roomId, messageId, emoji }` | React to message |
| `voice-join` | `{ roomId }` | Join voice channel |
| `voice-leave` | `{ roomId }` | Leave voice channel |
| `voice-mute` | `{ roomId, muted }` | Mute/unmute |
| `webrtc-offer` | `{ targetUserId, sdp }` | SDP offer relay |
| `webrtc-answer` | `{ targetUserId, sdp }` | SDP answer relay |
| `webrtc-ice` | `{ targetUserId, candidate }` | ICE candidate relay |
| `screen-share-start` | `{ roomId }` | Screen share started |
| `screen-share-stop` | `{ roomId }` | Screen share stopped |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room-state` | Full room + playback state | Emitted on join |
| `user-joined` | `{ userId, displayName, avatarUrl }` | User joined |
| `user-left` | `{ userId, reason? }` | User left |
| `kicked` | `{ roomId }` | You were kicked |
| `play` | `{ position, serverTime, userId }` | Sync play |
| `pause` | `{ position, serverTime, userId }` | Sync pause |
| `seek` | `{ position, serverTime, userId }` | Sync seek |
| `speed-change` | `{ speed, serverTime, userId }` | Sync speed |
| `video-change` | `{ videoUrl, videoTitle, serverTime }` | New video loaded |
| `video-ended` | `{ userId }` | Video ended |
| `sync-response` | Full playback state | Response to sync-request |
| `all-ready` | `{ serverTime }` | All members done buffering |
| `user-buffering` | `{ userId, buffering }` | Member buffering state |
| `new-message` | Full message object | New chat message |
| `typing-update` | `{ userIds }` | Who is typing |
| `message-reacted` | `{ messageId, reactions }` | Reaction update |
| `voice-peers` | `{ peerIds }` | Existing voice peers on join |
| `voice-connected` | `{ userId }` | Peer joined voice |
| `voice-disconnected` | `{ userId }` | Peer left voice |
| `voice-status` | `{ userId, muted }` | Peer mute status |
| `webrtc-offer` | `{ fromUserId, sdp }` | Forwarded SDP offer |
| `webrtc-answer` | `{ fromUserId, sdp }` | Forwarded SDP answer |
| `webrtc-ice` | `{ fromUserId, candidate }` | Forwarded ICE candidate |

---

## Architecture Decisions

### Sync Strategy
The server holds authoritative playback state in Redis. On any play/pause/seek/speed event:
1. Server validates the emitter has control rights
2. Updates Redis state with server timestamp
3. Broadcasts to all room members
4. Clients apply RTT correction using `serverTime`

Drift correction: clients can emit `sync-request` at any time to get the adjusted current position (accounting for elapsed time since last state update).

### Horizontal Scaling
- Socket.IO uses the Redis adapter — multiple backend instances share the same namespace
- Stateless HTTP with JWT — any instance handles any request
- Bull queues are Redis-backed — workers run on any instance

### WebRTC Architecture
- Mesh P2P for ≤6 voice participants (via Socket.IO signaling relay)
- SFU upgrade path (mediasoup) designed in for larger rooms — swap `voice.socket.ts` signaling

### Security
- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens (15min) + refresh rotation (7 days)
- Access token blacklist in Redis on logout
- Banned users checked in Socket.IO middleware
- Helmet, CORS, rate limiting on all routes
- Zod schema validation on all request bodies

---

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

---

## Deployment

### Build production image
```bash
docker build -t watchparty-backend:latest .
```

### Environment checklist for production
- [ ] Strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (≥64 chars)
- [ ] `DATABASE_URL` pointing to production PostgreSQL
- [ ] `REDIS_URL` pointing to production Redis
- [ ] Google/Discord OAuth credentials configured
- [ ] SMTP credentials for email
- [ ] AWS S3 bucket + CloudFront configured
- [ ] TURN server credentials for WebRTC
- [ ] `PROMETHEUS_ENABLED=true` + Grafana dashboard

---

## Seed Credentials (dev only)

| Role | Email | Password |
|---|---|---|
| Admin | admin@watchparty.app | Admin@123456 |
| Moderator | mod@watchparty.app | Mod@123456 |
| User | alice@watchparty.app | User@123456 |
| User | bob@watchparty.app | User@123456 |
| Demo Room | code: `DEMO01` | — |
