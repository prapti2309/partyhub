"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Check, X, UserMinus, MessageSquare } from "lucide-react";
import { useFriendsStore } from "../../stores/friends.store";
import { Navigation } from "../../components/Navigation";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
import { useToast } from "../../components/ui/Toast";

export default function FriendsPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const {
    friends,
    requests,
    isLoading,
    fetchFriendsAndRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useFriendsStore();

  const [addUsername, setAddUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchFriendsAndRequests();
  }, [fetchFriendsAndRequests]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;

    setIsSubmitting(true);
    try {
      await sendFriendRequest(addUsername);
      success(`Friend request dispatched to ${addUsername}!`, "Request Dispatched");
      setAddUsername("");
    } catch (e) {
      toastError("Failed to send friend request.", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async (id: string, name: string) => {
    await acceptFriendRequest(id);
    success(`You are now friends with ${name}!`, "Request Approved");
  };

  const handleDecline = async (id: string, name: string) => {
    await declineFriendRequest(id);
    success(`Friend request from ${name} declined.`, "Request Declined");
  };

  const handleRemove = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from your friend list?`)) {
      await removeFriend(id);
      success(`${name} was removed from your friend list.`, "Friend Removed");
    }
  };

  const onlineFriends = friends.filter((f) => f.status !== "OFFLINE");

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Social Network</h1>
            <p className="text-sm text-text-secondary">
              Manage your connections and view watching status
            </p>
          </div>
        </div>

        <Tabs defaultValue="online" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-4 mb-6">
            <TabsList>
              <TabsTrigger value="online">
                <span>Online</span>
                <Badge
                  variant="primary"
                  className="ml-2 font-mono text-[9px] px-1 py-0 bg-primary/20"
                >
                  {onlineFriends.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="all">
                <span>All Connections</span>
                <Badge variant="secondary" className="ml-2 font-mono text-[9px] px-1 py-0">
                  {friends.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                <span>Requests Queue</span>
                {requests.length > 0 && (
                  <Badge variant="danger" className="ml-2 font-mono text-[9px] px-1 py-0">
                    {requests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="add">
                <span>Add Friend</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ONLINE Tab */}
          <TabsContent value="online">
            <Card className="border-border/80">
              <CardContent className="p-6">
                {onlineFriends.length > 0 ? (
                  <div className="divide-y divide-border/40 space-y-3.5">
                    {onlineFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between pt-3.5 first:pt-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={friend.avatarUrl}
                            fallback={friend.username}
                            status={friend.status.toLowerCase() as any}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{friend.username}</span>
                            <span className="text-xs text-text-secondary truncate max-w-sm mt-0.5">
                              {friend.activity
                                ? `Watching: ${friend.activity.watching}`
                                : friend.customStatus || "Online"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {friend.activity?.roomCode && (
                            <Button
                              onClick={() => router.push(`/room/${friend.activity?.roomCode}`)}
                              size="sm"
                              className="px-2.5 py-1 text-[11px] h-auto"
                            >
                              Join Room
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-full cursor-pointer text-text-secondary hover:text-text-primary"
                          >
                            <MessageSquare className="h-4.5 w-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(friend.id, friend.username)}
                            className="p-2 rounded-full cursor-pointer text-text-secondary hover:text-error"
                          >
                            <UserMinus className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-secondary text-sm">
                    No friends online right now.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALL Tab */}
          <TabsContent value="all">
            <Card className="border-border/80">
              <CardContent className="p-6">
                {friends.length > 0 ? (
                  <div className="divide-y divide-border/40 space-y-3.5">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between pt-3.5 first:pt-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={friend.avatarUrl}
                            fallback={friend.username}
                            status={friend.status.toLowerCase() as any}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{friend.username}</span>
                            <span className="text-xs text-text-secondary uppercase tracking-wider text-[10px] font-mono mt-0.5">
                              {friend.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(friend.id, friend.username)}
                            className="p-2 rounded-full text-text-secondary hover:text-error"
                          >
                            <UserMinus className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-secondary text-sm">
                    Your friend list is currently empty.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PENDING Tab */}
          <TabsContent value="pending">
            <Card className="border-border/80">
              <CardContent className="p-6">
                {requests.length > 0 ? (
                  <div className="divide-y divide-border/40 space-y-3.5">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between pt-3.5 first:pt-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={req.requesterAvatar} fallback={req.requesterName} />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{req.requesterName}</span>
                            <span className="text-xs text-text-secondary">
                              Wants to connect • {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(req.id, req.requesterName)}
                            className="flex items-center gap-1 bg-success hover:bg-success/90 px-3 py-1 h-auto text-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDecline(req.id, req.requesterName)}
                            className="flex items-center gap-1 px-3 py-1 h-auto text-xs border border-border"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-secondary text-sm">
                    No pending friend requests.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADD Tab */}
          <TabsContent value="add">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserPlus className="h-4.5 w-4.5 text-primary" />
                  <span>Send Friend Invitation</span>
                </CardTitle>
                <CardDescription>
                  Enter the exact username of the WatchParty member to send them a connection invite
                  request.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="neon_nova"
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="h-10 px-6 shrink-0 cursor-pointer"
                  >
                    Send Friend Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
