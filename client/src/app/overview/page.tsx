"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "../../components/ui/Spinner";

export default function OverviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen bg-background items-center justify-center text-text-secondary gap-3">
      <Spinner className="h-6 w-6 text-primary" />
      <span className="text-sm font-semibold">Redirecting to Dashboard...</span>
    </div>
  );
}
