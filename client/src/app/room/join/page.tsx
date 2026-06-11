"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Compass, Film, ArrowRight } from "lucide-react";
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

const joinRoomSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Room code must be exactly 6 characters." })
    .max(6, { message: "Room code must be exactly 6 characters." })
    .toUpperCase(),
  password: z.string().optional(),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

export default function JoinRoomPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { joinRoom, roomsList } = useRoomStore();
  const { success, error: toastError } = useToast();

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
  } = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      code: "",
      password: "",
    },
  });

  const code = watch("code");
  const [passwordRequired, setPasswordRequired] = useState(false);

  // Check if room code requires password in real-time
  useEffect(() => {
    if (code.length === 6) {
      const room = roomsList.find((r) => r.code.toUpperCase() === code.toUpperCase());
      if (room && room.password) {
        setPasswordRequired(true);
      } else {
        setPasswordRequired(false);
      }
    } else {
      setPasswordRequired(false);
    }
  }, [code, roomsList]);

  if (!isAuthenticated || !user) return null;

  const onSubmit = async (data: JoinRoomFormValues) => {
    setIsSubmitting(true);
    try {
      const room = roomsList.find((r) => r.code.toUpperCase() === data.code.toUpperCase());

      // Password check simulation
      if (room && room.password && room.password !== data.password) {
        toastError("Incorrect passcode entered for this private room.", "Access Denied");
        setIsSubmitting(false);
        return;
      }

      await joinRoom(data.code, user.username);
      success(`Joined Watch Room: ${data.code}`, "Successfully Joined");
      router.push(`/room/${data.code.toUpperCase()}`);
    } catch (e) {
      toastError("Could not resolve room connection.", "Connection Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="border-border bg-surface shadow-xl glass">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Compass className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Join Watch Room</CardTitle>
              <CardDescription>Enter a 6-character room code to sync playback</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="6-Digit Room Code"
                  placeholder="NEONDM"
                  maxLength={6}
                  {...register("code")}
                  error={errors.code?.message}
                  disabled={isSubmitting}
                  className="font-mono text-center text-lg tracking-widest uppercase placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
                />

                {/* Password field if required */}
                {passwordRequired && (
                  <Input
                    label="Enter Room Passcode"
                    type="password"
                    placeholder="Password required..."
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
                  isLoading={isSubmitting}
                >
                  <span>Connect to Room</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
