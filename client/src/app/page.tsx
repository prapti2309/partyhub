"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play,
  Users,
  MessageSquare,
  Mic,
  Video,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";

export default function Home() {
  const router = useRouter();

  // Animation constants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      {/* Global Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 border-b border-border/40">
        {/* Background gradient grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2e2e4a_1px,transparent_1px),linear-gradient(to_bottom,#2e2e4a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Badge variant="primary" className="px-3 py-1 text-xs gap-1.5 glass font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Introducing WatchParty 2.0</span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl leading-tight bg-gradient-to-r from-text-primary via-text-primary to-primary bg-clip-text text-transparent"
          >
            Watch anything together,
            <br />
            from <span className="text-primary font-extrabold">anywhere</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed"
          >
            Synchronize movie nights, TV shows, lectures, and live streams in real time with HD
            video calls, low-latency voice chat, and rich message pings.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md"
          >
            <Button
              size="lg"
              onClick={() => router.push("/register")}
              className="flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/room/join")}
              className="border-border hover:bg-panel cursor-pointer"
            >
              <span>Join a Room</span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Product Demo Showcase */}
      <section className="py-20 bg-surface/30 border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="relative rounded-xl border border-border bg-panel overflow-hidden shadow-2xl glass"
          >
            {/* Window control circles */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-background/50">
              <div className="h-3 w-3 rounded-full bg-error/70" />
              <div className="h-3 w-3 rounded-full bg-warning/70" />
              <div className="h-3 w-3 rounded-full bg-success/70" />
              <span className="text-xs text-text-secondary ml-4 font-mono select-none">
                https://watchparty.app/room/NEONDM
              </span>
            </div>

            {/* Simulated WatchParty App Mock */}
            <div className="aspect-[16/10] bg-[#0A0A10] flex flex-col sm:flex-row overflow-hidden">
              {/* Left Main Pane (Player) */}
              <div className="flex-1 flex flex-col border-r border-border/40">
                {/* Embedded mock video frame */}
                <div className="relative flex-1 bg-black flex items-center justify-center group overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
                    alt="Mock Movie"
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Floating Sync indicator */}
                  <Badge
                    variant="primary"
                    className="absolute top-4 left-4 font-mono text-xs flex items-center gap-1.5 shadow glass bg-primary/20 border-primary/40 animate-pulse"
                  >
                    <Zap className="h-3 w-3 text-primary fill-primary" />
                    <span>SYNCED</span>
                  </Badge>

                  {/* Giant play icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="h-7 w-7 fill-white translate-x-0.5" />
                  </div>

                  {/* Player control HUD */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent flex flex-col gap-2">
                    <div className="h-1 w-full bg-zinc-700/80 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>02:15 / 06:45</span>
                      <span>Neon Nights Trailer</span>
                    </div>
                  </div>
                </div>

                {/* Voice Bar simulation */}
                <div className="h-14 bg-panel border-t border-border/40 px-4 flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-success animate-ping" />
                    <span className="font-semibold text-text-primary">Voice Connected</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="px-2 py-1 h-auto text-[11px]">
                      Mute
                    </Button>
                    <Button size="sm" variant="secondary" className="px-2 py-1 h-auto text-[11px]">
                      Deafen
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar (Chat & Members) */}
              <div className="w-full sm:w-72 bg-surface flex flex-col">
                <div className="p-3 border-b border-border/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Room Chat
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    2 Online
                  </Badge>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 flex flex-col gap-3.5 overflow-y-auto no-scrollbar font-sans text-xs">
                  <div className="flex gap-2.5">
                    <Avatar fallback="RC" className="h-7 w-7" />
                    <div className="flex flex-col bg-panel p-2 rounded-lg max-w-[80%]">
                      <span className="font-semibold text-text-primary mb-0.5">retro_coder</span>
                      <span className="text-text-secondary leading-relaxed">
                        This trailer looks incredible in sync!
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Avatar fallback="NN" className="h-7 w-7" />
                    <div className="flex flex-col bg-primary/10 border border-primary/20 p-2 rounded-lg max-w-[80%]">
                      <span className="font-semibold text-primary mb-0.5">neon_nova</span>
                      <span className="text-text-primary leading-relaxed">
                        Lag is practically zero. Movie starting in 5 mins!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat input */}
                <div className="p-3 border-t border-border/40 bg-panel/30">
                  <div className="flex gap-1.5 items-center bg-surface border border-border rounded-md px-2 py-1.5">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none flex-1"
                      disabled
                    />
                    <Button size="sm" className="p-1 h-auto text-[10px] bg-primary">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Showcases Grid (Sync, Chat, Voice, Video Calls) */}
      <section className="py-24 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl text-text-primary tracking-tight">
              Designed for virtual movie nights.
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed text-base sm:text-lg">
              No more countdowns. No more pausing to let others catch up. We handle the heavy
              lifting.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Sync Card */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full flex flex-col gap-4 hover:border-primary/50 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 w-fit group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Real-Time Sync</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Playback controls are broadcasted instantaneously to everyone. Drift is
                  auto-corrected within 150ms.
                </p>
              </Card>
            </motion.div>

            {/* Chat Card */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full flex flex-col gap-4 hover:border-primary/50 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 w-fit group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Rich Chat</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Express yourself with real-time text chat, customizable emoji reactions, and
                  typing indicator loops.
                </p>
              </Card>
            </motion.div>

            {/* Voice Card */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full flex flex-col gap-4 hover:border-primary/50 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 w-fit group-hover:scale-110 transition-transform">
                  <Mic className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Voice Channels</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Connect instantly via high-fidelity WebRTC audio channel streams with push-to-talk
                  toggles.
                </p>
              </Card>
            </motion.div>

            {/* Video Card */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 h-full flex flex-col gap-4 hover:border-primary/50 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 w-fit group-hover:scale-110 transition-transform">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Webcam Overlay</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Turn on your camera or share your screen directly alongside the player using clean
                  grid panels.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-surface/10 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl text-text-primary tracking-tight">
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed text-base sm:text-lg">
              Whether you want casual weekend watch parties or large-scale community streams, we
              have a plan for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 flex flex-col justify-between border-border hover:border-border/80 transition-all relative overflow-hidden">
              <div>
                <h3 className="text-xl font-bold">WatchParty Free</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Perfect for close friends and couples.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-text-primary">$0</span>
                  <span className="text-sm font-semibold text-text-secondary">/month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-text-secondary">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-success" />
                    <span>Up to 10 members per room</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-success" />
                    <span>Real-time playback synchronization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-success" />
                    <span>Basic text chat and emojis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-success" />
                    <span>Standard WebRTC voice calls</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="mt-8 w-full cursor-pointer"
                onClick={() => router.push("/register")}
              >
                Start Free
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 flex flex-col justify-between border-primary bg-panel relative overflow-hidden shadow-xl ring-2 ring-primary/20">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                Popular
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>WatchParty Pro</span>
                  <Sparkles className="h-4 w-4 text-primary fill-primary" />
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Unlock large rooms, HD streams, and custom themes.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-text-primary">$4.99</span>
                  <span className="text-sm font-semibold text-text-secondary">/month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-text-secondary">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Up to 50 members per room</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span>HD 1080p camera overlay streams</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Custom room status overlays & colors</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority queue support & moderation logs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Custom emoji pack uploads</span>
                  </li>
                </ul>
              </div>
              <Button
                className="mt-8 w-full cursor-pointer"
                onClick={() => router.push("/register")}
              >
                Upgrade to Pro
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="h-7 w-7 text-primary" />
              <span>Frequently Asked Questions</span>
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {[
              {
                q: "How does the synchronization work?",
                a: "WatchParty coordinates room controls using direct WebSockets (Socket.IO). When the host clicks play, pause, or seeks to a timeline, the event is immediately pushed to other players. An auto-correction loop corrects lag if a viewer drifts behind.",
              },
              {
                q: "Do I need a Netflix or YouTube account?",
                a: "It depends on the stream source. Direct URLs, Youtube videos, and open-source formats require no subscriptions. Premium embeds may require individual authentication inside respective containers.",
              },
              {
                q: "Can anyone control the player?",
                a: "By default, only the room owner controls playback. However, you can toggle 'Shared Controls' in the Room Settings to allow anyone in the room to play, pause, and seek.",
              },
              {
                q: "Is there voice activity indicators?",
                a: "Yes! While in the voice channel, speakers will have active green outlines around their avatars mimicking Discord speak rings.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="p-6 bg-panel/30 border-border/80">
                <h3 className="text-base font-bold text-text-primary flex items-start gap-3">
                  <span className="text-primary font-mono">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed pl-6">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-panel">
        <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-text-primary">
            Ready to host your first movie night?
          </h2>
          <p className="mt-4 text-text-secondary max-w-lg mx-auto text-base">
            Create a watch room, share the invite code link, and start viewing with friends within
            seconds. No downloads required.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/register")}
              className="gap-2 cursor-pointer"
            >
              <span>Sign Up Now</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 bg-background border-t border-border/40 text-text-secondary text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold font-mono">
              W
            </div>
            <span className="font-semibold text-text-primary text-base">WatchParty</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-text-primary transition-colors">
              About
            </Link>
            <Link href="/features" className="hover:text-text-primary transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors">
              Contact
            </Link>
          </div>
          <span className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} WatchParty Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
