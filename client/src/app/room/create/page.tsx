"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, HelpCircle, Lock, Users, Video } from "lucide-react";
import { useRoomStore } from "../../../stores/room.store";
import { useAuthStore } from "../../../stores/auth.store";
import { Navigation } from "../../../components/Navigation";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/Card";
import { useToast } from "../../../components/ui/Toast";

const createRoomSchema = z.object({
  name: z.string().min(3, { message: "Room name must be at least 3 characters." }).max(30),
  isPublic: z.boolean(),
  password: z.string().optional(),
  maxCapacity: z.coerce.number().min(2).max(50),
  sharedControls: z.boolean(),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createRoom } = useRoomStore();
  const { success } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema) as any,
    defaultValues: {
      name: "",
      isPublic: true,
      password: "",
      maxCapacity: 10,
      sharedControls: false,
    },
  });

  const isPublic = watch("isPublic");

  if (!isAuthenticated || !user) return null;

  const onSubmit = async (data: CreateRoomFormValues) => {
    setIsSubmitting(true);
    try {
      const roomSettings = {
        sharedControls: data.sharedControls,
        chatEnabled: true,
        voiceEnabled: true,
        videoEnabled: true,
        guestAllowed: true,
      };

      const room = await createRoom(data.name, roomSettings, data.maxCapacity, user.username);

      success(`Room "${data.name}" created successfully! Code: ${room.code}`, "Room Created");
      router.push(`/room/${room.code}`);
    } catch (e) {
      console.error("Room creation error", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <Card className="border-border bg-surface shadow-xl glass">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Video className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Host Watch Room</CardTitle>
              <CardDescription>Setup your custom room settings to stream together</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Room Name"
                  placeholder="Neon Movie Night 🌌"
                  {...register("name")}
                  error={errors.name?.message}
                  disabled={isSubmitting}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Public/Private Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Privacy Level
                    </label>
                    <select
                      {...register("isPublic")}
                      disabled={isSubmitting}
                      className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="true">Public (Listed)</option>
                      <option value="false">Private (Hidden)</option>
                    </select>
                  </div>

                  {/* Room Max Capacity */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Max Capacity
                    </label>
                    <select
                      {...register("maxCapacity")}
                      disabled={isSubmitting}
                      className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="5">5 Members</option>
                      <option value="10">10 Members (Default)</option>
                      <option value="20">20 Members</option>
                      <option value="50">50 Members (Pro Only)</option>
                    </select>
                  </div>
                </div>

                {/* Password field if room is private */}
                {!isPublic && (
                  <Input
                    label="Optional Room Password"
                    type="password"
                    placeholder="Enter passcode..."
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                  />
                )}

                {/* Shared controls check */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-panel/30 mt-2">
                  <input
                    type="checkbox"
                    id="sharedControls"
                    {...register("sharedControls")}
                    disabled={isSubmitting}
                    className="mt-0.5 h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5 select-none cursor-pointer">
                    <label
                      htmlFor="sharedControls"
                      className="text-sm font-semibold text-text-primary cursor-pointer"
                    >
                      Shared Playback Controls
                    </label>
                    <span className="text-xs text-text-secondary">
                      Allow all room members to play, pause, and seek the video (Default: Host
                      controls only).
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
                  isLoading={isSubmitting}
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Create Room</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
