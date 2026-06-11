"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/Navigation";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-16 px-4 max-w-7xl mx-auto w-full flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            Plans & Tier Options
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            Flexible pricing for all viewers.
          </h1>
          <p className="mt-4 text-text-secondary text-lg leading-relaxed">
            Choose the membership that fits you best. Get started immediately for free or unlock the
            full experience with a Pro subscription.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Free Plan */}
          <Card className="p-8 flex flex-col justify-between border-border bg-surface hover:border-border/80 transition-all shadow-md">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">WatchParty Free</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Perfect for casual date nights and sync testings.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-text-primary">$0</span>
                <span className="text-sm font-semibold text-text-secondary">/month</span>
              </div>
              <div className="mt-8 border-t border-border/50 pt-8">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                  Included Features
                </h4>
                <ul className="space-y-4 text-sm text-text-secondary">
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-success" />
                    <span>Up to 10 members per watch room</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-success" />
                    <span>Full real-time video synchronization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-success" />
                    <span>Basic text chat and message history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-success" />
                    <span>Standard voice chat channels</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-8 w-full"
              onClick={() => router.push("/register")}
            >
              Get Started Free
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 flex flex-col justify-between border-primary bg-panel relative overflow-hidden shadow-xl ring-4 ring-primary/10">
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl">
              Most Popular
            </div>
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <span>WatchParty Pro</span>
                    <Sparkles className="h-4.5 w-4.5 text-primary fill-primary animate-pulse" />
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Premium features for communities and streamers.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-text-primary">$4.99</span>
                <span className="text-sm font-semibold text-text-secondary">/month</span>
              </div>
              <div className="mt-8 border-t border-border/50 pt-8">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                  Pro Benefits
                </h4>
                <ul className="space-y-4 text-sm text-text-secondary">
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-primary" />
                    <span>Up to 50 members per watch room</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-primary" />
                    <span>High definition video overlay webcam feeds</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-primary" />
                    <span>Customizable room colors and themes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-primary" />
                    <span>Custom emoji triggers and banner uploads</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4.5 w-4.5 text-primary" />
                    <span>Priority servers and moderation tools</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button className="mt-8 w-full" onClick={() => router.push("/register")}>
              Unlock Pro Now
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
