"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Compass, Film, Radio, ArrowRight, UserPlus } from "lucide-react";
import { useRoomStore } from "../stores/room.store";
import { useFriendsStore } from "../stores/friends.store";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { roomsList } = useRoomStore();
  const { friends } = useFriendsStore();

  const activePublicRooms = roomsList.filter((r) => r.isPublic);
  const onlineFriends = friends.filter(
    (f) => f.status === "ONLINE" || f.status === "AWAY" || f.status === "BUSY"
  );

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
      {/* Quick Access Actions */}
      <Card className="p-5 flex flex-col gap-3 glass border-border/80 shadow-md">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Quick Actions
        </h3>
        <Button
          onClick={() => router.push("/room/create")}
          className="w-full flex items-center justify-start gap-2.5"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Watch Room</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/room/join")}
          className="w-full flex items-center justify-start gap-2.5 border-border hover:bg-panel"
        >
          <Compass className="h-4.5 w-4.5 text-text-secondary" />
          <span>Join Room with Code</span>
        </Button>
      </Card>

      {/* Active Watch Rooms */}
      <Card className="p-5 flex flex-col gap-4 border-border/80 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Active Rooms
          </h3>
          <Badge variant="success" className="animate-pulse">
            Live
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {activePublicRooms.length > 0 ? (
            activePublicRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => router.push(`/room/${room.code}`)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-panel/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {room.name}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {room.members.length} watching • {room.code}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))
          ) : (
            <p className="text-xs text-text-secondary py-2 text-center">No active public rooms.</p>
          )}
        </div>
      </Card>

      {/* Friends Activity */}
      <Card className="p-5 flex flex-col gap-4 border-border/80 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Friend Activity
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/friends")}
            className="p-1 h-auto text-xs text-primary hover:bg-transparent"
          >
            Manage
          </Button>
        </div>

        <div className="flex flex-col gap-3.5">
          {onlineFriends.length > 0 ? (
            onlineFriends.map((friend) => (
              <div key={friend.id} className="flex items-start gap-3">
                <Avatar
                  src={friend.avatarUrl}
                  fallback={friend.username}
                  status={friend.status.toLowerCase() as any}
                  size="sm"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold truncate">{friend.username}</span>
                    {friend.activity?.roomCode && (
                      <Badge
                        onClick={() => router.push(`/room/${friend.activity?.roomCode}`)}
                        variant="primary"
                        className="cursor-pointer text-[9px] px-1 py-0 hover:bg-primary/25"
                      >
                        Join
                      </Badge>
                    )}
                  </div>
                  {friend.activity ? (
                    <span className="text-xs text-text-secondary truncate mt-0.5 flex items-center gap-1.5">
                      <Film className="h-3 w-3 flex-shrink-0" />
                      <span>
                        Watching:{" "}
                        <strong className="text-text-primary font-medium">
                          {friend.activity.watching}
                        </strong>
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-text-secondary truncate italic mt-0.5">
                      {friend.customStatus || "Online"}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 flex flex-col items-center gap-2">
              <p className="text-xs text-text-secondary">No friends online right now.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/friends")}
                className="mt-1.5 flex items-center gap-1.5 text-xs px-2.5 py-1"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Friends</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </aside>
  );
};
export default Sidebar;
