"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Trash2 } from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import { Navigation } from "../../../components/Navigation";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useToast } from "../../../components/ui/Toast";

interface MockReport {
  id: string;
  reporter: string;
  target: string;
  type: "User" | "Room" | "Message";
  reason: string;
  details: string;
  status: "PENDING" | "RESOLVED";
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { success } = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const [reports, setReports] = useState<MockReport[]>([
    {
      id: "rep-1",
      reporter: "retro_coder",
      target: "spammer_99",
      type: "User",
      reason: "Spam / Harassment",
      details: "Spamming random links in chat dome.",
      status: "PENDING",
    },
    {
      id: "rep-2",
      reporter: "pixel_princess",
      target: "room-gen-XYZ123",
      type: "Room",
      reason: "Inappropriate Content",
      details: "Streaming copyright material without permissions.",
      status: "PENDING",
    },
  ]);

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

  const handleResolve = (id: string, action: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" as const } : r))
    );
    success(`Report resolved via: ${action}`, "Report Updated");
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
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Report Queue</h1>
            <p className="text-sm text-text-secondary">
              Process reports and moderate room activities
            </p>
          </div>
        </div>

        <Card className="border-border/80">
          <CardContent className="p-6">
            <div className="divide-y divide-border/40 space-y-4">
              {reports.filter((r) => r.status === "PENDING").length > 0 ? (
                reports
                  .filter((r) => r.status === "PENDING")
                  .map((rep) => (
                    <div
                      key={rep.id}
                      className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 first:pt-0"
                    >
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <Badge
                            variant="danger"
                            className="text-[9px] uppercase tracking-wider font-semibold"
                          >
                            {rep.type} Report
                          </Badge>
                          <span className="text-xs text-text-secondary">
                            From: <strong>{rep.reporter}</strong> • Target:{" "}
                            <strong>{rep.target}</strong>
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-text-primary mt-1">
                          Reason: {rep.reason}
                        </h4>
                        <p className="text-xs text-text-secondary max-w-2xl leading-relaxed mt-0.5">
                          {rep.details}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleResolve(rep.id, "Keep Content / Dismiss")}
                          className="bg-success hover:bg-success/90 flex items-center gap-1 text-xs px-3 py-1.5 h-auto cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Dismiss</span>
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleResolve(rep.id, "Take Down Target")}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 h-auto cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Moderate</span>
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10 text-text-secondary text-sm">
                  Report queue is currently clear!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
