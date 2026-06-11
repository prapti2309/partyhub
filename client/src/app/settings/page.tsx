"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, Shield, Trash2, Bell, Volume2, Moon } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { Navigation } from "../../components/Navigation";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { success, warning } = useToast();

  const [toggles, setToggles] = useState({
    emailNotifs: true,
    pushNotifs: true,
    sharedControlsDefault: false,
    lowLatencyVoice: true,
    noiseSuppression: true,
    darkMode: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    success("Preference setting updated.", "Settings Saved");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you absolutely sure you want to delete your WatchParty account? This operation is permanent and cannot be undone."
      )
    ) {
      warning("Your account is scheduled for deletion.", "Account Disabled");
      logout();
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <SettingsIcon className="h-7 w-7 text-primary" />
            <span>Preferences settings</span>
          </h1>

          <div className="flex flex-col gap-6">
            {/* Interface Settings */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Moon className="h-4.5 w-4.5 text-primary" />
                  <span>Interface Preferences</span>
                </CardTitle>
                <CardDescription>Adjust dashboard viewing styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div>
                    <h4 className="font-semibold text-sm">Theme Mode</h4>
                    <p className="text-xs text-text-secondary">
                      Toggle between Light and Dark mode options.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleToggle("darkMode")}>
                    {toggles.darkMode ? "Dark Mode Active" : "Light Mode Active"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification settings */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-primary" />
                  <span>Notification Toggles</span>
                </CardTitle>
                <CardDescription>Manage where you receive watch pings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div>
                    <h4 className="font-semibold text-sm">Email Invitations</h4>
                    <p className="text-xs text-text-secondary">
                      Get emails when friends invite you to join watch rooms.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleToggle("emailNotifs")}>
                    {toggles.emailNotifs ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div>
                    <h4 className="font-semibold text-sm">In-App Push Banner Alerts</h4>
                    <p className="text-xs text-text-secondary">
                      Display floating alerts for chat mentions and friend invites.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleToggle("pushNotifs")}>
                    {toggles.pushNotifs ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audio Voice settings */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Volume2 className="h-4.5 w-4.5 text-primary" />
                  <span>Voice Channel Options</span>
                </CardTitle>
                <CardDescription>
                  Fine-tune WebRTC latency and audio capture settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div>
                    <h4 className="font-semibold text-sm">Low-latency Audio Streaming</h4>
                    <p className="text-xs text-text-secondary">
                      Prioritize audio packet speeds over noise fidelity.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggle("lowLatencyVoice")}
                  >
                    {toggles.lowLatencyVoice ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <div>
                    <h4 className="font-semibold text-sm">Echo noise suppression</h4>
                    <p className="text-xs text-text-secondary">
                      Apply automated background filtering loops to microphone captures.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggle("noiseSuppression")}
                  >
                    {toggles.noiseSuppression ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety & Danger zone */}
            <Card className="border-error/20 bg-error/[0.02]">
              <CardHeader>
                <CardTitle className="text-base font-bold text-error flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>Irreversible actions for your profile data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">Delete Account</h4>
                    <p className="text-xs text-text-secondary">
                      Permanently delete your profile, room settings, and friend records.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex items-center gap-1.5 cursor-pointer"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
