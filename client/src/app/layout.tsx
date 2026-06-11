import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../providers/AppProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WatchParty — Watch Anything, Together",
  description:
    "Watch movies, TV shows, and anime synchronized in real time with integrated chat, voice, and video calls.",
  keywords: [
    "watchparty",
    "video sync",
    "watch together",
    "netflix sync",
    "youtube sync",
    "voice chat",
    "video calls",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
