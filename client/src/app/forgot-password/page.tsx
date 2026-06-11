"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, ArrowLeft, MailOpen } from "lucide-react";
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

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setEmailSent(true);
    success("Recovery link dispatched to your inbox!", "Reset Requested");
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        <Card className="border-border bg-surface shadow-xl glass">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              We&apos;ll send you an email containing instructions to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              <div className="flex flex-col items-center justify-center py-4 text-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/20 border border-success/30 text-success flex items-center justify-center">
                  <MailOpen className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm">Check Your Email</h4>
                <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                  We&apos;ve sent a password recovery link to your email. Click the link inside to
                  configure a new login password.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setEmailSent(false)}
                >
                  Resend Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="you@domain.com"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                />

                <Button type="submit" className="w-full cursor-pointer" isLoading={isSubmitting}>
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
