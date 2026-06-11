"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2, Calendar, Film, UserPlus } from "lucide-react";
import { useNotificationStore } from "../../stores/notification.store";
import { Navigation } from "../../components/Navigation";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";

export default function NotificationsPage() {
  const router = useRouter();
  const { success } = useToast();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    success("Notification marked as read.", "Marked Read");
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    success("All notifications marked as read.", "Marked Read");
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    success("Notification deleted.", "Removed Alert");
  };

  const handleAction = (n: any) => {
    markAsRead(n.id);
    if (n.type === "ROOM_INVITE" && n.data.roomCode) {
      router.push(`/room/${n.data.roomCode}`);
    } else if (n.type === "FRIEND_REQUEST") {
      router.push("/friends");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 max-w-3xl mx-auto w-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Notification Center</h1>
              <p className="text-sm text-text-secondary">
                Track invitations, mentions, and updates
              </p>
            </div>
          </div>

          {notifications.some((n) => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border-border hover:bg-panel cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Mark All as Read</span>
            </Button>
          )}
        </div>

        <Card className="border-border/85">
          <CardContent className="p-6">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border/40 space-y-4">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start justify-between gap-4 pt-4 first:pt-0 ${
                      !n.read
                        ? "bg-primary/[0.01] -mx-4 px-4 py-2.5 rounded-lg border-l-2 border-primary"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3 min-w-0 flex-1">
                      {n.data.senderAvatar ? (
                        <Avatar
                          src={n.data.senderAvatar}
                          fallback={n.data.senderName || "?"}
                          size="sm"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                          <Bell className="h-4 w-4" />
                        </div>
                      )}

                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">
                            {n.type === "ROOM_INVITE"
                              ? "Room Invitation"
                              : n.type === "FRIEND_REQUEST"
                                ? "Friend Request"
                                : "System Notification"}
                          </span>
                          {!n.read && (
                            <Badge
                              variant="primary"
                              className="text-[8px] px-1 py-0 bg-primary/25 border-primary/40 animate-pulse"
                            >
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed">
                          {n.type === "ROOM_INVITE" ? (
                            <span>
                              <strong>{n.data.senderName}</strong> invited you to join their watch
                              party{" "}
                              <strong className="text-text-primary">
                                &quot;{n.data.roomName}&quot;
                              </strong>
                              .
                            </span>
                          ) : n.type === "FRIEND_REQUEST" ? (
                            <span>
                              <strong>{n.data.senderName}</strong> sent you a friend request.
                            </span>
                          ) : n.type === "FRIEND_ACCEPTED" ? (
                            <span>
                              <strong>{n.data.senderName}</strong> approved your friend request.
                            </span>
                          ) : (
                            n.data.message
                          )}
                        </p>

                        <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(n)}
                          className="px-2.5 py-1 text-[11px] h-auto cursor-pointer"
                        >
                          {n.type === "ROOM_INVITE" ? (
                            <span className="flex items-center gap-1">
                              <Film className="h-3 w-3" /> Join
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <UserPlus className="h-3 w-3" /> View
                            </span>
                          )}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 h-auto text-text-secondary hover:text-error rounded-full cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-text-secondary text-sm flex flex-col items-center gap-3">
                <Bell className="h-10 w-10 text-border" />
                <span>No notifications in your inbox.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
