"use client";

import React from "react";
import { Film, Terminal, Sparkles, Heart } from "lucide-react";
import { Navigation } from "../../components/Navigation";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-16 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">
            Our Mission
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            Connecting screens and voices.
          </h1>
          <p className="mt-4 text-text-secondary text-lg leading-relaxed">
            WatchParty was built to eliminate distance, providing a seamless digital environment for
            social viewing.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <Card className="border-border bg-surface overflow-hidden shadow-md">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                  <Film className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">The Vision</h2>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Whether you want to reaction-stream new anime releases, study lectures in remote
                study groups, or share dates across cities, we believe that entertainment is
                fundamentally social. Traditional platforms isolate viewers behind personal
                accounts. WatchParty recreates the shared living-room couch online.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface overflow-hidden shadow-md">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                  <Terminal className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Clean Architecture Rebuild</h2>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                This project represents a complete, clean rebuild of the legacy WatchParty
                prototype, migrating to enterprise Next.js App Router patterns, TypeScript, Tailwind
                CSS variables, and Zustand state synchronization. By replacing localized
                localStorage room state and coupled backend bindings, this framework provides a
                production-grade foundation ready for API integrations.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-xs text-text-secondary py-6">
            <Heart className="h-4 w-4 text-error fill-error animate-pulse" />
            <span>Built with passion by the WatchParty Team. Ready for prime time.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
