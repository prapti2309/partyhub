"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film, Sparkles, Tv, Compass, Play, Plus, Clock } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useRoomStore } from "../../stores/room.store";
import { Navigation } from "../../components/Navigation";
import { Sidebar } from "../../components/Sidebar";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { MOCK_CATALOG } from "../../utils/mock-data";
import { useToast } from "../../components/ui/Toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createRoom } = useRoomStore();
  const { success } = useToast();

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleStartCatalogParty = async (title: string, url: string) => {
    try {
      success(`Starting WatchParty room for "${title}"...`, "Initializing Room");
      const defaultSettings = {
        sharedControls: false,
        chatEnabled: true,
        voiceEnabled: true,
        videoEnabled: true,
        guestAllowed: true,
      };

      const newRoom = await createRoom(`${title} Party 🍿`, defaultSettings, 10, user.username);

      router.push(`/room/${newRoom.code}`);
    } catch (e) {
      console.error("Failed to quick-launch watchparty", e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Side Main Dashboard Area */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Welcome Banner */}
          <Card className="p-6 border-primary bg-gradient-to-r from-panel via-panel/85 to-primary/10 relative overflow-hidden shadow-lg glass">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Film className="h-40 w-40 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col gap-2 max-w-lg">
              <Badge
                variant="primary"
                className="w-fit gap-1 text-[10px] uppercase font-bold tracking-wider mb-1"
              >
                <Sparkles className="h-3.5 w-3.5 fill-primary" />
                <span>Dashboard Overview</span>
              </Badge>
              <h2 className="text-2xl font-bold sm:text-3xl leading-tight">
                Welcome back, {user.profile?.displayName || user.username}!
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mt-1">
                Watch movies, series, or YouTube videos synchronized in real time with friends.
                Create a room or pick a video from the catalog below to launch a party.
              </p>
            </div>
          </Card>

          {/* Quick Create/Join cards for Mobile (hidden on desktop since sidebar handles it) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            <Card className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-primary/10 text-primary border border-primary/20">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm">Host a Watch Room</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Create a public or password-protected room and invite your friends.
              </p>
              <Button onClick={() => router.push("/room/create")} size="sm" className="w-full">
                Host Room
              </Button>
            </Card>

            <Card className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-primary/10 text-primary border border-primary/20">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm">Join via Room Code</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enter an invitation link or 6-digit code to connect to an ongoing party.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/room/join")}
                size="sm"
                className="w-full"
              >
                Join Room
              </Button>
            </Card>
          </div>

          {/* Featured Video Catalog */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tv className="h-4 w-4 text-primary" />
              <span>Suggested Media Catalog</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MOCK_CATALOG.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-border/80 bg-panel/30 hover:border-primary/45 transition-all group flex flex-col"
                >
                  {/* Mock thumbnail overlay */}
                  <div className="relative aspect-[16/10] bg-black/60 overflow-hidden flex items-center justify-center border-b border-border/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&auto=format&fit=crop&q=60`}
                      alt={item.title}
                      className="h-full w-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />

                    {/* Badge showing category */}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-semibold"
                    >
                      {item.type}
                    </Badge>

                    {/* Floating play trigger */}
                    <Button
                      onClick={() => handleStartCatalogParty(item.title, item.url)}
                      size="sm"
                      className="absolute opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 shadow bg-primary"
                    >
                      <Play className="h-3.5 w-3.5 fill-white mr-1.5" />
                      <span>Host Party</span>
                    </Button>
                  </div>

                  {/* Details card content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-text-secondary">
                        {item.provider} • {item.year}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tag.split(", ").map((t) => (
                        <span
                          key={t}
                          className="text-[9px] bg-surface border border-border/60 text-text-secondary px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity history logs */}
          <Card className="p-5 border-border/80">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Recent Activity History</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-text-secondary py-1 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>
                    Hosted <strong className="text-text-primary">Neon Dome</strong> watch room
                  </span>
                </div>
                <span>3 days ago</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary py-1 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>
                    Joined <strong className="text-text-primary">Synth Samurai</strong> party
                  </span>
                </div>
                <span>4 days ago</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar Widget Panels */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </main>
    </div>
  );
}
