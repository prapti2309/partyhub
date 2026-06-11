"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Film, UserPlus } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
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

const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username cannot exceed 20 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Only alphanumeric characters and underscores are allowed.",
    }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { error: toastError, success } = useToast();
  const registerAction = useAuthStore((state) => state.register);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Zustand auth store triggers register simulator
      await registerAction(data.username, data.email);
      success("Account created successfully!", `Welcome to WatchParty, ${data.username}!`);
      router.push("/dashboard");
    } catch (e) {
      toastError("Failed to register. Please try another email.", "Registration Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = (provider: string) => {
    success(`Redirecting to ${provider} OAuth...`, `${provider} Sign Up`);
    setTimeout(async () => {
      await registerAction(
        `${provider.toLowerCase()}_member`,
        `${provider.toLowerCase()}@watchparty.app`
      );
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand Link */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary group-hover:bg-primary-hover transition-colors">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary group-hover:text-primary transition-colors">
              WatchParty
            </span>
          </Link>
          <p className="text-sm text-text-secondary">Create an account to watch together</p>
        </div>

        <Card className="border-border bg-surface shadow-xl glass">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>Join WatchParty for synchronized viewing</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="neon_nova"
                {...register("username")}
                error={errors.username?.message}
                disabled={isSubmitting}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@domain.com"
                {...register("email")}
                error={errors.email?.message}
                disabled={isSubmitting}
              />

              <div className="relative w-full">
                <Input
                  label="Password"
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

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 cursor-pointer"
                isLoading={isSubmitting}
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up Free</span>
              </Button>
            </form>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-3 text-text-secondary text-[11px] font-semibold uppercase tracking-wider">
                Or Sign Up With
              </span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuth("Google")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 border-border hover:bg-panel cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.204 4.114-3.486 0-6.311-2.825-6.311-6.311s2.825-6.311 6.311-6.311c1.782 0 3.296.729 4.437 1.9l3.197-3.197C19.593 2.766 16.149 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c6.043 0 10.05-4.243 10.05-10.222 0-.685-.06-1.35-.171-1.993H12.24z" />
                </svg>
                <span className="text-xs font-semibold">Google</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth("Discord")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 border-border hover:bg-panel cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 127.14 96.36" fill="currentColor">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2.07a75.79,75.79,0,0,0,72.9,0c.82.73,1.68,1.42,2.58,2.07a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,50.77,123.63,28.09,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
                </svg>
                <span className="text-xs font-semibold">Discord</span>
              </Button>
            </div>

            <div className="text-center pt-2 text-xs text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
