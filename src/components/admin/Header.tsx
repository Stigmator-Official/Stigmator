"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  CreditCard,
  Shield,
  Menu,
  X,
  Plus,
  Sparkles,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoleBadge } from "./RoleBadge";
import type { User as UserType } from "@/types/database";
import type { UserRole } from "@/lib/permissions";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}

interface HeaderProps {
  user?: UserType | AdminUser | null;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "alert" | "system" | "artist";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Order",
    message: "Order #12345 requires approval",
    time: "2 min ago",
    read: false,
    type: "order",
  },
  {
    id: "2",
    title: "Artist Application",
    message: "New artist application from Marcus Chen",
    time: "1 hour ago",
    read: false,
    type: "artist",
  },
  {
    id: "3",
    title: "System Alert",
    message: "Payment gateway sync completed",
    time: "3 hours ago",
    read: true,
    type: "system",
  },
];

const quickActions = [
  { label: "New Product", icon: Plus, href: "/admin/products/new" },
  { label: "Create Promo", icon: Sparkles, href: "/admin/promo-codes/new" },
  { label: "View Reports", icon: Command, href: "/admin/analytics" },
];

export function Header({ user, onMenuClick, showMobileMenu, className }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const role = (user?.role as UserRole) || "CUSTOMER";
  // Handle both User and AdminUser types
  const displayName = (user as any)?.displayName || (user as any)?.fullName || (user as any)?.name || "Admin User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <div className="w-2 h-2 bg-[#4ade80]" />;
      case "alert":
        return <div className="w-2 h-2 bg-[#fbbf24]" />;
      case "artist":
        return <div className="w-2 h-2 bg-[#a78bfa]" />;
      default:
        return <div className="w-2 h-2 bg-[#6b8e6b]" />;
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <header
        className={cn(
          "h-16 bg-[#0a0f0a] border-b border-[#1a2e1a]",
          "flex items-center justify-between px-4 lg:px-6",
          "fixed top-0 left-0 right-0 z-30",
          className
        )}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders, products, customers..."
                    className={cn(
                      "w-full h-10 pl-10 pr-10 bg-[#050805] border border-[#1a2e1a]",
                      "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                      "focus:border-[#4ade80] focus:outline-none transition-colors"
                    )}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8e6b] hover:text-[#e8f5e8]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Search...</span>
                      <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-[#1a2e1a] text-[#6b8e6b] text-xs font-mono">
                        ⌘K
                      </kbd>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1a2e1a] border-[#1a2e1a] text-[#e8f5e8]">
                    <p>Quick search</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8]"
            >
              <DropdownMenuLabel className="text-[#6b8e6b] font-mono text-xs">
                QUICK ACTIONS
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1a2e1a]" />
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={action.label} onClick={() => window.location.href = action.href}>
                    <Icon className="w-4 h-4 text-[#4ade80] mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] p-0"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2e1a]">
                <span className="font-black tracking-tighter">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#4ade80] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[#6b8e6b]">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left border-b border-[#1a2e1a] last:border-b-0",
                        "hover:bg-[#1a2e1a] transition-colors",
                        !notification.read && "bg-[#4ade80]/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#e8f5e8]">
                            {notification.title}
                          </p>
                          <p className="text-xs text-[#6b8e6b] truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#6b8e6b] mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#4ade80] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-[#1a2e1a]">
                <a
                  href="/admin/notifications"
                  className="block w-full py-2 text-center text-sm text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors"
                >
                  View all notifications
                </a>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1.5 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors">
                <div className="w-8 h-8 bg-[#4ade80] flex items-center justify-center">
                  <span className="text-black font-bold text-sm">{initials}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#e8f5e8]">{displayName}</p>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={role} size="sm" />
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8]"
            >
              <DropdownMenuLabel className="text-[#6b8e6b] font-mono text-xs">
                MY ACCOUNT
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1a2e1a]" />
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-[#e8f5e8]">{displayName}</p>
                <p className="text-xs text-[#6b8e6b]">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-[#1a2e1a]" />
              <DropdownMenuItem onClick={() => window.location.href = "/admin/profile"}>
                <User className="w-4 h-4 text-[#4ade80] mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/settings"}>
                <Settings className="w-4 h-4 text-[#4ade80] mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/admin/billing"}>
                <CreditCard className="w-4 h-4 text-[#4ade80] mr-2" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1a2e1a]" />
              <DropdownMenuItem onClick={() => window.location.href = "/"}>
                <Shield className="w-4 h-4 text-[#4ade80] mr-2" />
                View Platform
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1a2e1a]" />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10 focus:bg-[#dc2626]/10"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default Header;
