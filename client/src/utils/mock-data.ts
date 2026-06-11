import { User, Room, ChatMessage, Notification, Friend, FriendRequest } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    username: "neon_nova",
    email: "nova@domain.com",
    role: "USER",
    createdAt: "2026-01-15T08:30:00Z",
    profile: {
      displayName: "Nova ✨",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=nova",
      bio: "Lost in the synthwaves. Code by day, anime by night.",
      status: "Chilling in Neon Dome",
      bannerUrl: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
    },
  },
  {
    id: "user-2",
    username: "retro_coder",
    email: "retro@domain.com",
    role: "MODERATOR",
    createdAt: "2026-02-10T12:00:00Z",
    profile: {
      displayName: "Retro Coder",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
      bio: "CRT monitors are superior. Let's watch retro sci-fi.",
      status: "Coding components...",
    },
  },
  {
    id: "user-3",
    username: "cyber_samurai",
    email: "samurai@domain.com",
    role: "USER",
    createdAt: "2026-03-01T15:45:00Z",
    profile: {
      displayName: "Kenshin",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=kenshin",
      bio: "Loyal to the watch queue.",
      status: "Offline",
    },
  },
  {
    id: "user-admin",
    username: "admin_prime",
    email: "admin@watchparty.app",
    role: "ADMIN",
    createdAt: "2025-12-01T00:00:00Z",
    profile: {
      displayName: "Prime Overlord",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=admin",
      bio: "Root admin for WatchParty.",
      status: "Moderating...",
    },
  },
];

export const MOCK_FRIENDS: Friend[] = [
  {
    id: "user-2",
    username: "retro_coder",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
    status: "ONLINE",
    customStatus: "Coding components...",
    activity: {
      watching: "Synth Samurai (Ep 3)",
      roomCode: "SYNTH3",
    },
  },
  {
    id: "user-3",
    username: "cyber_samurai",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=kenshin",
    status: "OFFLINE",
  },
  {
    id: "friend-3",
    username: "pixel_princess",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel",
    status: "AWAY",
    customStatus: "Grabbing snacks 🍿",
  },
  {
    id: "friend-4",
    username: "lofi_girl",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=lofi",
    status: "BUSY",
    customStatus: "Study beats to study/relax to 📚",
    activity: {
      watching: "Lofi Live Radio",
    },
  },
];

export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: "freq-1",
    requesterId: "user-req-1",
    requesterName: "vaporwave_vibe",
    requesterAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=vapor",
    createdAt: "2026-05-30T10:00:00Z",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "ROOM_INVITE",
    data: {
      senderId: "user-2",
      senderName: "retro_coder",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
      roomId: "synth-room",
      roomCode: "SYNTH3",
      roomName: "Synth Samurai Watchalong",
      message: "Hey! Join our room, we're starting Episode 3!",
    },
    read: false,
    createdAt: "2026-05-31T14:30:00Z",
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "FRIEND_ACCEPTED",
    data: {
      senderId: "user-2",
      senderName: "retro_coder",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
    },
    read: true,
    createdAt: "2026-05-30T11:20:00Z",
  },
];

export const MOCK_ROOMS: Room[] = [
  {
    id: "room-1",
    code: "NEONDM",
    name: "Neon Dome 🌌",
    isPublic: true,
    maxCapacity: 10,
    ownerId: "user-1",
    createdAt: "2026-05-31T12:00:00Z",
    members: [
      {
        userId: "user-1",
        username: "neon_nova",
        avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=nova",
        role: "OWNER",
        isMuted: false,
        isDeafened: false,
        speaking: false,
      },
      {
        userId: "user-2",
        username: "retro_coder",
        avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
        role: "COHOST",
        isMuted: false,
        isDeafened: false,
        speaking: true,
      },
    ],
    settings: {
      sharedControls: false,
      chatEnabled: true,
      voiceEnabled: true,
      videoEnabled: true,
      guestAllowed: true,
    },
    videoSession: {
      videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
      videoTitle: "Neon Nights Trailer",
      position: 45.2,
      isPlaying: true,
      speed: 1.0,
    },
  },
  {
    id: "room-2",
    code: "SYNTH3",
    name: "Synth Samurai Watchalong",
    isPublic: false,
    password: "ninja",
    maxCapacity: 6,
    ownerId: "user-2",
    createdAt: "2026-05-31T14:00:00Z",
    members: [
      {
        userId: "user-2",
        username: "retro_coder",
        avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
        role: "OWNER",
        isMuted: false,
        isDeafened: false,
        speaking: false,
      },
      {
        userId: "friend-3",
        username: "pixel_princess",
        avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel",
        role: "VIEWER",
        isMuted: true,
        isDeafened: false,
        speaking: false,
      },
    ],
    settings: {
      sharedControls: true,
      chatEnabled: true,
      voiceEnabled: true,
      videoEnabled: false,
      guestAllowed: false,
    },
    videoSession: {
      videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
      videoTitle: "Synth Samurai EP 03",
      position: 120.0,
      isPlaying: false,
      speed: 1.0,
    },
  },
];

export const MOCK_CATALOG = [
  {
    id: "m1",
    type: "movie",
    title: "Neon Nights",
    year: 2022,
    provider: "WatchParty Original",
    url: "https://www.youtube.com/embed/ysz5S6PUM-U",
    tag: "sci-fi, synth, action",
  },
  {
    id: "m2",
    type: "movie",
    title: "Synth Samurai",
    year: 2020,
    provider: "Retro Anime",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tag: "anime, cyberpunk, classic",
  },
  {
    id: "s1",
    type: "series",
    title: "Midnight MGMT",
    year: 2023,
    provider: "Cyber Series",
    url: "https://www.youtube.com/embed/ScMzIvxBSi4",
    tag: "drama, hackers",
  },
  {
    id: "s2",
    type: "series",
    title: "Streetlight Saga",
    year: 2024,
    provider: "Vibe TV",
    url: "https://www.youtube.com/embed/2Vv-BfVoq4g",
    tag: "comfort, indie",
  },
  {
    id: "a1",
    type: "anime",
    title: "Arcade Oni",
    year: 2019,
    provider: "Neon Shonen",
    url: "https://www.youtube.com/embed/kJQP7kiw5Fk",
    tag: "shonen, gaming, adventure",
  },
  {
    id: "a2",
    type: "anime",
    title: "Cloud Kintsugi",
    year: 2021,
    provider: "Sora Studio",
    url: "https://www.youtube.com/embed/tgbNymZ7vqY",
    tag: "slice of life, relaxing",
  },
];

export const MOCK_CHAT: ChatMessage[] = [
  {
    id: "msg-1",
    roomId: "room-1",
    userId: "user-2",
    username: "retro_coder",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
    content: "Yo! Welcome to the Neon Dome. The trailer looks sick in dark mode.",
    pinned: false,
    createdAt: "2026-05-31T12:05:00Z",
    reactions: [
      { emoji: "🔥", users: ["neon_nova"] },
      { emoji: "👀", users: ["pixel_princess"] },
    ],
  },
  {
    id: "msg-2",
    roomId: "room-1",
    userId: "user-1",
    username: "neon_nova",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=nova",
    content:
      "Thanks for dropping in! Feel free to sync up. I'm checking the voice latency right now.",
    pinned: true,
    createdAt: "2026-05-31T12:06:12Z",
    reactions: [],
  },
  {
    id: "msg-3",
    roomId: "room-1",
    userId: "user-2",
    username: "retro_coder",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
    content: "Voice connection is solid. Less than 100ms lag. Let's queue the next one soon.",
    pinned: false,
    createdAt: "2026-05-31T12:08:45Z",
    reactions: [{ emoji: "👍", users: ["neon_nova"] }],
  },
];
