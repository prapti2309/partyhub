# WatchParty — Development Roadmap

## Vision

WatchParty is evolving from a high-fidelity frontend simulation into a real distributed realtime media synchronization platform.

The frontend architecture, UI/UX, Prisma schema, and infrastructure planning are already strong.  
The next stage focuses on transforming the mocked realtime system into a production-grade backend architecture while preserving the existing frontend abstractions.

This roadmap defines the correct engineering order to avoid:

- socket spaghetti
- sync instability
- premature WebRTC complexity
- frontend rewrites
- technical debt accumulation

---

# Current Project State

| Layer                   | Status           |
| ----------------------- | ---------------- |
| UI/UX                   | Strong           |
| Frontend Architecture   | Strong           |
| State Management        | Strong           |
| Prisma Schema           | Production Ready |
| Docker Infrastructure   | Production Ready |
| API Contracts           | Planned          |
| Socket Event Design     | Planned          |
| Backend Runtime         | Missing          |
| Distributed Sync Engine | Missing          |
| WebRTC Infrastructure   | Missing          |

---

# Engineering Philosophy

## Core Principles

### 1. Incremental Replacement Over Rewrite

The frontend simulation layer already mirrors the intended backend behavior.

The goal is:

- replace mocks gradually
- preserve frontend APIs
- swap fake transports for real transports

NOT:

- rebuild frontend from scratch

---

### 2. Backend First, Features Later

Do not rush into:

- video calls
- webcam grids
- advanced moderation
- reactions

Before:

- auth
- room lifecycle
- socket stability
- sync correctness

exist reliably.

---

### 3. Realtime State Must Be Authoritative

The server must become the source of truth for:

- room membership
- playback state
- permissions
- synchronization timing
- presence

Frontend should reflect state, not invent it.

---

### 4. Redis Handles Realtime

Redis is for:

- ephemeral state
- presence
- pub/sub
- room synchronization
- transient playback state

PostgreSQL is only for:

- persistence
- accounts
- room history
- audit data
- moderation records

---

# Recommended Backend Architecture

txt server/ ├── src/ │ ├── app.ts ├── server.ts │ ├── config/ │ ├── env.ts │ ├── prisma.ts │ ├── redis.ts │ ├── socket.ts │ └── logger.ts │ ├── routes/ │ ├── auth.routes.ts │ ├── room.routes.ts │ └── user.routes.ts │ ├── controllers/ │ ├── auth.controller.ts │ ├── room.controller.ts │ └── user.controller.ts │ ├── services/ │ ├── auth.service.ts │ ├── room.service.ts │ ├── sync.service.ts │ ├── presence.service.ts │ └── token.service.ts │ ├── repositories/ │ ├── user.repository.ts │ ├── room.repository.ts │ └── session.repository.ts │ ├── sockets/ │ ├── index.ts │ │ │ ├── events/ │ │ ├── room.events.ts │ │ ├── player.events.ts │ │ ├── chat.events.ts │ │ └── voice.events.ts │ │ │ ├── handlers/ │ │ ├── room.handler.ts │ │ ├── player.handler.ts │ │ ├── chat.handler.ts │ │ └── voice.handler.ts │ │ │ ├── emitters/ │ │ ├── room.emitter.ts │ │ ├── player.emitter.ts │ │ └── chat.emitter.ts │ │ │ ├── middleware/ │ │ └── socketAuth.ts │ │ │ └── validators/ │ └── socket.validators.ts │ ├── middleware/ │ ├── auth.middleware.ts │ ├── error.middleware.ts │ ├── rateLimit.middleware.ts │ └── validation.middleware.ts │ ├── validators/ │ ├── auth.validators.ts │ ├── room.validators.ts │ └── player.validators.ts │ ├── jobs/ │ ├── email.worker.ts │ └── cleanup.worker.ts │ ├── utils/ │ ├── jwt.ts │ ├── errors.ts │ ├── timestamps.ts │ └── drift.ts │ ├── types/ │ ├── socket.types.ts │ ├── auth.types.ts │ └── room.types.ts │ └── tests/

---

# Recommended Tech Stack

## Backend Core

- Node.js
- TypeScript
- Express
- Socket.IO
- Prisma
- PostgreSQL
- Redis

---

## Security

- bcrypt
- jsonwebtoken
- helmet
- cors
- express-rate-limit

---

## Validation

- zod

---

## Logging & Monitoring

- pino
- pino-pretty
- Prometheus
- Grafana

---

## Background Jobs

- BullMQ

---

# Development Phases

# Phase 0 — Frontend Stabilization

## Goal

Stabilize frontend before backend integration begins.

---

## Tasks

### Fix Runtime Errors

- Import missing Film icon
- Resolve all TypeScript warnings
- Remove dead imports

---

### Add Tooling

- ESLint
- Prettier
- Husky pre-commit hooks

---

### Enable Strict TypeScript

json "strict": true

---

### Centralize Config

Create:
txt src/config/

for:

- API URLs
- socket URLs
- feature flags
- environment detection

---

## Deliverable

A deterministic frontend with zero build instability.

---

# Phase 1 — Backend Foundation

## Goal

Create a scalable backend runtime and folder architecture.

---

## Tasks

### Initialize Backend

Create:
bash npm init -y

---

### Install Core Dependencies

bash npm install express socket.io prisma redis zod dotenv cors helmet bcrypt jsonwebtoken

---

### Configure TypeScript

Create:

- tsconfig.json
- nodemon.json

---

### Setup Config Systems

Implement:

- Prisma client
- Redis client
- environment loader
- logger

---

### Setup Error Handling

Global middleware:

- API errors
- validation errors
- async handler wrapping

---

## Deliverable

Bootable backend server with health routes.

---

# Phase 2 — Authentication System

## Goal

Build production-grade authentication.

---

## REST APIs

txt POST /auth/register POST /auth/login POST /auth/refresh POST /auth/logout GET /auth/me

---

## Tasks

### Password Security

- bcrypt hashing
- password validation

---

### JWT Infrastructure

- access tokens
- refresh tokens
- rotation strategy

---

### Session Security

- httpOnly cookies
- CSRF strategy
- token invalidation

---

### Email Verification

Use BullMQ workers.

---

## Deliverable

Stable auth infrastructure with persistent sessions.

---

# Phase 3 — Room Infrastructure

## Goal

Create authoritative room lifecycle management.

---

## Core Features

- create room
- join room
- leave room
- owner transfer
- permissions
- participant tracking

---

## Redis Responsibilities

Redis stores:

- active rooms
- socket presence
- playback state
- heartbeat timestamps

---

## PostgreSQL Responsibilities

Postgres stores:

- room metadata
- ownership history
- bans
- moderation actions

---

## Deliverable

Persistent rooms with realtime presence.

---

# Phase 4 — Socket.IO Synchronization

## Goal

Replace simulated socket traffic with real distributed state.

---

## Initial Events

txt room:join room:leave player:play player:pause player:seek chat:send chat:typing

---

## Rules

### NEVER:

- emit directly from controllers
- mutate frontend state blindly

---

### ALWAYS:

- validate payloads
- route through services
- broadcast canonical state

---

## Deliverable

Functional realtime synchronization system.

---

# Phase 5 — Drift Correction Engine

## Goal

Build reliable synchronized playback.

---

# Core Concept

The host becomes the authoritative playback source.

Clients periodically compare:
txt currentTime

against:
txt serverTime

---

## Drift Handling

### If:

txt drift < threshold

Do nothing.

---

### If:

txt drift > threshold

Soft-correct playback position.

---

## Sync Data Structure

ts { roomId, currentTime, playing, playbackRate, timestamp }

---

## Deliverable

Stable synchronized playback with drift recovery.

---

# Phase 6 — Chat & Presence

## Goal

Implement realtime social systems.

---

## Features

- typing indicators
- online presence
- reactions
- unread counters
- participant updates

---

## Deliverable

Realtime social interaction layer.

---

# Phase 7 — WebRTC Voice

## Goal

Introduce voice channels gradually.

---

## IMPORTANT

Do NOT start with webcam streaming.

Start with:

1. signaling
2. peer negotiation
3. voice-only streams

---

## Socket Signaling Events

txt voice:offer voice:answer voice:ice-candidate voice:join voice:leave

---

## Deliverable

Stable voice communication.

---

# Phase 8 — Webcam & Screen Share

## Goal

Add optional media overlays.

---

## Features

- webcam toggles
- participant grids
- screen share
- media permissions

---

## WARNING

This phase is extremely bandwidth-sensitive.

Optimize:

- stream count
- bitrate
- participant limits

---

## Deliverable

Optional visual collaboration layer.

---

# Phase 9 — Observability & Reliability

## Goal

Production hardening.

---

## Monitoring

Track:

- socket latency
- reconnect frequency
- room counts
- drift frequency
- WebRTC failures

---

## Logging

Use:

- structured logs
- request IDs
- socket tracing

---

## Deliverable

Operational visibility into the platform.

---

# Event-Driven Architecture Pattern

## Correct Flow

txt Frontend Action ↓ Socket Event ↓ Validation Layer ↓ Service Layer ↓ Redis Coordination ↓ Canonical State Broadcast ↓ Frontend Reconciliation

---

# Recommended Git Strategy

## Branches

txt main develop feature/auth feature/rooms feature/socket-sync feature/webrtc

---

## Rules

- never commit broken builds
- merge only after testing
- isolate realtime features

---

# MVP Scope Cuts

To avoid burnout:

## Skip Initially

- AI moderation
- video uploads
- advanced analytics
- recording
- stream transcoding
- mobile apps
- friend recommendation systems

---

## Focus Instead On

- stable sync
- reliable rooms
- good UX
- resilient sockets
- clean architecture

---

# Most Important Engineering Lessons

This project is no longer about:

- React
- Tailwind
- animations

The real value comes from learning:

- distributed systems
- authoritative state
- realtime synchronization
- event-driven architecture
- WebRTC signaling
- infra orchestration
- consistency under latency

These are senior-level engineering concepts.

---

# Final Strategic Goal

Transform WatchParty from:

> “a polished frontend simulation”

into:

> “a reliable distributed realtime platform.”

That transition is where the real engineering growth happens.
