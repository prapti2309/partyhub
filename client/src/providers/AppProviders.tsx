"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "../contexts/SocketContext";
import { WebRTCProvider } from "../contexts/WebRTCContext";
import { ToastProvider } from "../components/ui/Toast";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // Ensure queryClient is initialized only once in the browser session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <WebRTCProvider>
          <ToastProvider>{children}</ToastProvider>
        </WebRTCProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
};
