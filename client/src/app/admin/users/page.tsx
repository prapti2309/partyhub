"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ShieldAlert, ArrowLeft, Search, CheckCircle, Ban } from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import { Navigation } from "../../../components/Navigation";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { MOCK_USERS } from "../../../utils/mock-data";
import { useToast } from "../../../components/ui/Toast";

interface UserDetails {
  id: string;
  username: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  banned?: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { success } = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const [usersList, setUsersList] = useState<UserDetails[]>(MOCK_USERS as any);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  const handleToggleBan = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextBan = !u.banned;
          success(
            `User ${u.username} has been ${nextBan ? "banned" : "unbanned"}.`,
            "User Moderated"
          );
          return { ...u, banned: nextBan };
        }
        return u;
      })
    );
  };

  const handleRoleChange = (id: string, role: "USER" | "MODERATOR" | "ADMIN") => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          success(`User ${u.username} promoted to ${role}.`, "Role Updated");
          return { ...u, role };
        }
        return u;
      })
    );
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Manage Members</h1>
              <p className="text-sm text-text-secondary">
                Search profiles, edit roles, and suspend accounts
              </p>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-6 relative">
          <Input
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="h-4.5 w-4.5 text-text-secondary absolute left-3.5 top-3" />
        </div>

        <Card className="border-border/80">
          <CardContent className="p-6">
            <div className="divide-y divide-border/40 space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar fallback={u.username} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate flex items-center gap-2">
                          <span>{u.username}</span>
                          {u.banned && (
                            <Badge variant="danger" className="text-[8px] px-1 py-0">
                              Banned
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-text-secondary truncate">{u.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Role selection dropdown */}
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        disabled={u.id === user.id}
                        className="bg-panel border border-border text-xs text-text-secondary rounded px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="USER">User</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <Button
                        variant={u.banned ? "secondary" : "danger"}
                        size="sm"
                        disabled={u.id === user.id}
                        onClick={() => handleToggleBan(u.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 h-auto cursor-pointer"
                      >
                        {u.banned ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Unban</span>
                          </>
                        ) : (
                          <>
                            <Ban className="h-3.5 w-3.5" />
                            <span>Ban</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-text-secondary text-sm">
                  No users found matching search query.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
