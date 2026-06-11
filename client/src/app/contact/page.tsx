"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, MessageSquare, Send, Check } from "lucide-react";
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
import { useToast } from "../../components/ui/Toast";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting contact request:", data);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    success("Your message has been sent successfully!", "Message Sent");
    reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="flex-1 py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <Card className="border-border bg-surface shadow-xl glass">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                <span>Contact Support</span>
              </CardTitle>
              <CardDescription>
                Have questions or need help with room syncing? Send us a message and we&apos;ll
                reply shortly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-success/20 border border-success/30 text-success flex items-center justify-center">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Message Received!</h3>
                  <p className="text-sm text-text-secondary max-w-sm">
                    Thank you for reaching out. A developer support member will review your request
                    and reply to your email soon.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Jane Doe"
                      {...register("name")}
                      error={errors.name?.message}
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="jane@example.com"
                      {...register("email")}
                      error={errors.email?.message}
                      disabled={isSubmitting}
                    />
                  </div>

                  <Input
                    label="Subject"
                    placeholder="General Inquiry / Room Sync Issue"
                    {...register("subject")}
                    error={errors.subject?.message}
                    disabled={isSubmitting}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Message Content
                    </label>
                    <textarea
                      placeholder="Describe your issue or suggestions..."
                      rows={5}
                      {...register("message")}
                      className={`flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.message
                          ? "border-error focus-visible:ring-error focus-visible:border-error"
                          : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <span className="text-xs text-error font-medium">
                        {errors.message.message}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-2 cursor-pointer"
                    isLoading={isSubmitting}
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
