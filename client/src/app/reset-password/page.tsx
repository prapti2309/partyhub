"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

const resetSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { success } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsSubmitting(true);
    // Simulate API reset delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setComplete(true);
    success("Your login password has been modified successfully!", "Password Changed");
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-border bg-surface shadow-xl glass">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">New Password</CardTitle>
            <CardDescription>Setup your new secure login password below</CardDescription>
          </CardHeader>

          <CardContent>
            {complete ? (
              <div className="flex flex-col items-center justify-center py-4 text-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/20 border border-success/30 text-success flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm">Update Complete</h4>
                <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                  Your password has been changed. You may now log in to your WatchParty account with
                  your new credentials.
                </p>
                <Button
                  className="mt-4 w-full cursor-pointer"
                  onClick={() => router.push("/login")}
                >
                  Log In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative w-full">
                  <Input
                    label="Choose New Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary cursor-pointer focus:outline-none"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                />

                <Button type="submit" className="w-full cursor-pointer" isLoading={isSubmitting}>
                  Save Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
