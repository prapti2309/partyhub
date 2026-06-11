"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Users, Film, AlertTriangle, ArrowRight, Settings } from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import { Navigation } from "../../../components/Navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 max-w-6xl mx-auto w-full flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Moderation Hub</h1>
            <p className="text-sm text-text-secondary">
              Monitor platform stats, user reports, and active sessions
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-5 border-border/80">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Registered
                </span>
                <h3 className="text-2xl font-bold mt-1">10,240</h3>
              </div>
              <div className="p-2 rounded bg-panel text-text-secondary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Active Watch Rooms
                </span>
                <h3 className="text-2xl font-bold mt-1">512</h3>
              </div>
              <div className="p-2 rounded bg-panel text-text-secondary">
                <Film className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Reports Queue
                </span>
                <h3 className="text-2xl font-bold mt-1 text-warning">8</h3>
              </div>
              <div className="p-2 rounded bg-panel text-text-secondary">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  System Latency
                </span>
                <h3 className="text-2xl font-bold mt-1 text-success">85ms</h3>
              </div>
              <div className="p-2 rounded bg-panel text-text-secondary">
                <Settings className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Admin Navigation Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-border hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">User Moderation</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Search through active member databases, change user system roles, and issue
                temporary bans.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="w-full flex items-center justify-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card className="p-6 border-border hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">Report Logs</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Review flagged in-room chat logs, system alerts, spam reports, and custom
                complaints.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/admin/reports")}
              className="w-full flex items-center justify-center gap-1"
            >
              <span>Open Reports</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card className="p-6 border-border hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">Active Rooms</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Monitor live synchronized watchparty feeds, check room capacity settings, or close
                active sessions.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/admin/rooms")}
              className="w-full flex items-center justify-center gap-1"
            >
              <span>View Active Rooms</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
