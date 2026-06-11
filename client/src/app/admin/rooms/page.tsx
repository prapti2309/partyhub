"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, ArrowLeft, Trash2 } from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import { useRoomStore } from "../../../stores/room.store";
import { Navigation } from "../../../components/Navigation";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useToast } from "../../../components/ui/Toast";
import { Room } from "../../../types";

export default function AdminRoomsPage() {
  const router = useRouter();
  const { success } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { roomsList } = useRoomStore();

  const [activeRooms, setActiveRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setActiveRooms(roomsList);
  }, [user, isAuthenticated, router, roomsList]);

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  const handleForceClose = (id: string, name: string) => {
    if (confirm(`Force close room: "${name}"?`)) {
      setActiveRooms((prev) => prev.filter((r) => r.id !== id));
      success(`Watch room "${name}" terminated by administrator.`, "Room Terminated");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 max-w-5xl mx-auto w-full flex flex-col">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Mod Hub</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Active Rooms</h1>
            <p className="text-sm text-text-secondary">
              Monitor platform rooms, checking member counts and settings
            </p>
          </div>
        </div>

        <Card className="border-border/80">
          <CardContent className="p-6">
            <div className="divide-y divide-border/40 space-y-4">
              {activeRooms.length > 0 ? (
                activeRooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-semibold text-sm truncate flex items-center gap-2">
                        <span>{room.name}</span>
                        <Badge
                          variant="primary"
                          className="text-[8px] font-mono tracking-widest px-1 py-0"
                        >
                          {room.code}
                        </Badge>
                      </span>
                      <span className="text-xs text-text-secondary">
                        {room.members.length} members / max {room.maxCapacity} • Privacy:{" "}
                        {room.isPublic ? "Public" : "Private"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleForceClose(room.id, room.name)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 h-auto cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Force Close</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-text-secondary text-sm">
                  No active rooms on the platform.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
