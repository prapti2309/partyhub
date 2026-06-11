"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Film, Menu, User, Settings, LogOut, Users, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useNotificationStore } from "../stores/notification.store";
import { useFriendsStore } from "../stores/friends.store";
import { Button } from "./ui/Button";
import { Dropdown } from "./ui/Dropdown";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { Drawer } from "./ui/Drawer";
import { cn } from "../lib/utils";

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
  const { requests, fetchFriendsAndRequests } = useFriendsStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchNotifications();
      void fetchFriendsAndRequests();
    }
  }, [isAuthenticated, fetchNotifications, fetchFriendsAndRequests]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Check if current route is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Nav Items
  const publicNavItems = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const authNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: <Film className="h-4 w-4" /> },
    {
      label: "Friends",
      href: "/friends",
      icon: <Users className="h-4 w-4" />,
      badge: requests.length > 0 ? requests.length : undefined,
    },
  ];

  if (user?.role === "ADMIN") {
    authNavItems.push({
      label: "Admin Panel",
      href: "/admin/dashboard",
      icon: <ShieldAlert className="h-4 w-4" />,
    });
  }

  // Profile dropdown items
  const profileMenuItems = [
    {
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
      onClick: () => router.push("/profile"),
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => router.push("/settings"),
    },
    {
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4" />,
      className: "text-error hover:bg-error/10 hover:text-error",
      onClick: handleLogout,
    },
  ];

  // Notification items dropdown list
  const notificationItems = notifications.map((n) => ({
    label: (
      <div
        className={cn(
          "flex flex-col text-left gap-1 py-1 max-w-[280px]",
          !n.read && "font-semibold"
        )}
      >
        <span className="text-xs text-text-primary">
          {n.type === "ROOM_INVITE"
            ? `${n.data.senderName} invited you to join: ${n.data.roomName}`
            : n.type === "FRIEND_REQUEST"
              ? `${n.data.senderName} sent you a friend request`
              : n.type === "FRIEND_ACCEPTED"
                ? `${n.data.senderName} accepted your friend request`
                : n.data.message || "System Alert"}
        </span>
        <span className="text-[10px] text-text-secondary">
          {new Date(n.createdAt).toLocaleDateString()}
        </span>
      </div>
    ),
    onClick: () => {
      markAsRead(n.id);
      if (n.type === "ROOM_INVITE" && n.data.roomCode) {
        router.push(`/room/${n.data.roomCode}`);
      } else if (n.type === "FRIEND_REQUEST") {
        router.push("/friends");
      }
    },
  }));

  const notificationTrigger = (
    <Button variant="ghost" size="sm" className="relative p-2 rounded-full cursor-pointer">
      <Bell className="h-5 w-5 text-text-secondary hover:text-text-primary" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-1 ring-background" />
      )}
    </Button>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary group-hover:bg-primary-hover transition-colors">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary group-hover:text-primary transition-colors">
              WatchParty
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {!isAuthenticated
              ? publicNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-panel text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-panel/40"
                    )}
                  >
                    {item.label}
                  </Link>
                ))
              : authNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                      isActive(item.href)
                        ? "bg-panel text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-panel/40"
                    )}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge !== undefined && (
                      <Badge variant="danger" className="ml-1 px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
          </nav>
        </div>

        {/* Right Side: Account Controls */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Notification Center */}
              {notificationItems.length > 0 ? (
                <Dropdown trigger={notificationTrigger} items={notificationItems} />
              ) : (
                <Dropdown
                  trigger={notificationTrigger}
                  items={[
                    {
                      label: (
                        <span className="text-xs text-text-secondary p-2">
                          No new notifications
                        </span>
                      ),
                      disabled: true,
                    },
                  ]}
                />
              )}

              {/* Profile Avatar & Actions */}
              <Dropdown
                trigger={
                  <div className="cursor-pointer hover:ring-2 hover:ring-primary/45 rounded-full transition-all">
                    <Avatar
                      fallback={user?.username || "?"}
                      src={user?.profile?.avatarUrl}
                      status="online"
                      size="sm"
                    />
                  </div>
                }
                items={profileMenuItems}
              />
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/register")}>Sign Up</Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-panel transition-colors cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu"
        side="right"
      >
        <div className="flex flex-col gap-5 py-4">
          <nav className="flex flex-col gap-2">
            {!isAuthenticated
              ? publicNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-md text-base font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-panel text-text-primary"
                        : "text-text-secondary hover:bg-panel/40"
                    )}
                  >
                    {item.label}
                  </Link>
                ))
              : authNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-md text-base font-medium transition-colors flex items-center gap-3",
                      isActive(item.href)
                        ? "bg-panel text-text-primary"
                        : "text-text-secondary hover:bg-panel/40"
                    )}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge !== undefined && (
                      <Badge variant="danger" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
          </nav>

          {!isAuthenticated && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/login");
                }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/register");
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
};
export default Navigation;
