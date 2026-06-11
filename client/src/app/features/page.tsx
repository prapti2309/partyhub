"use client";

import React from "react";
import { Zap, MessageSquare, Mic, Video, Share2, Shield, Radio, Laptop } from "lucide-react";
import { Navigation } from "../../components/Navigation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export default function FeaturesPage() {
  const featuresList = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Real-time Sync",
      desc: "Synchronized playing, pausing, and seeking with low-latency event propagation. Everyone stays within milliseconds of the host's timeline position.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Interactive Chat",
      desc: "Instant typing indicators, custom emojis, text reactions, message pins, and structured pings to chat alongside your favorite streams.",
    },
    {
      icon: <Mic className="h-6 w-6 text-primary" />,
      title: "WebRTC Audio Channels",
      desc: "Crystal-clear peer-to-peer voice streaming with Discord-style speaking active rings, mute/unmute buttons, and per-user audio slider volumes.",
    },
    {
      icon: <Video className="h-6 w-6 text-primary" />,
      title: "Webcam Grid Layouts",
      desc: "Include camera overlay feeds alongside the main theater screen, adapting fluidly between voice focus grids and movie spotlight views.",
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Responsive Screen Sharing",
      desc: "Share your browser tabs or desktop workspace to stream unique video file formats, presentations, or live feeds directly inside your private room.",
    },
    {
      icon: <Laptop className="h-6 w-6 text-primary" />,
      title: "Cross-Platform Access",
      desc: "Expose dynamic interfaces that adapt fluidly between desktop browsers, tablets, and mobile drawer feeds, requiring absolutely zero extensions.",
    },
    {
      icon: <Radio className="h-6 w-6 text-primary" />,
      title: "Media Queue Playlists",
      desc: "Queue direct URLs or video uploads inside playlists, allowing back-to-back episode watching without disconnecting the stream sync.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Robust Room Permissions",
      desc: "Assign OWNER, COHOST, and VIEWER roles to control who can add to the queue or trigger play/pause actions, with moderator ban panels.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            Features Overview
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            How WatchParty connects you.
          </h1>
          <p className="mt-4 text-text-secondary text-lg leading-relaxed">
            Everything you need to experience movies and TV series with friends, family, and online
            communities under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 flex flex-col gap-4 bg-surface hover:border-primary/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-panel text-primary border border-border w-fit group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
