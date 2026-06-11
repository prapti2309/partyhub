"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User as UserIcon, Settings, Image as ImageIcon, Check } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
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
import { useToast } from "../../components/ui/Toast";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display Name must be at least 2 characters." })
    .max(30, { message: "Display Name cannot exceed 30 characters." }),
  bio: z.string().max(160, { message: "Bio cannot exceed 160 characters." }).optional(),
  status: z.string().max(50, { message: "Status cannot exceed 50 characters." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const { success } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seed, setSeed] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      status: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user) {
      setValue("displayName", user.profile?.displayName || user.username);
      setValue("bio", user.profile?.bio || "");
      setValue("status", user.profile?.status || "");
      setSeed(user.username);
    }
  }, [user, isAuthenticated, router, setValue]);

  if (!isAuthenticated || !user) return null;

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Update store state & localStorage
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
    updateProfile({
      displayName: data.displayName,
      bio: data.bio,
      status: data.status,
      avatarUrl,
    });

    setIsSubmitting(false);
    success("Your profile settings have been saved successfully!", "Profile Updated");
  };

  const handleRandomizeAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <UserIcon className="h-7 w-7 text-primary" />
            <span>Profile settings</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Avatar display & Customize */}
            <Card className="p-6 flex flex-col items-center text-center gap-4">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                Avatar Preview
              </span>

              <Avatar
                fallback={user.username}
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`}
                status="online"
                size="xl"
                className="ring-4 ring-primary/20"
              />

              <div className="flex flex-col gap-2 w-full mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRandomizeAvatar}
                  className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 text-text-secondary" />
                  <span>Randomize Avatar</span>
                </Button>
                <span className="text-[10px] text-text-secondary leading-normal">
                  Avatar generated dynamically using Dicebear API based on custom seed.
                </span>
              </div>
            </Card>

            {/* Form edit details */}
            <Card className="p-6 md:col-span-2 border-border/80">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Display Name"
                  placeholder="Nova ✨"
                  {...register("displayName")}
                  error={errors.displayName?.message}
                  disabled={isSubmitting}
                />

                <Input
                  label="Current Status"
                  placeholder="Watching Retro Sci-Fi..."
                  {...register("status")}
                  error={errors.status?.message}
                  disabled={isSubmitting}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Bio Description
                  </label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    rows={4}
                    {...register("bio")}
                    className={`flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.bio ? "border-error focus-visible:ring-error" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.bio && (
                    <span className="text-xs text-error font-medium">{errors.bio.message}</span>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto flex items-center gap-1.5 cursor-pointer"
                    isLoading={isSubmitting}
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
