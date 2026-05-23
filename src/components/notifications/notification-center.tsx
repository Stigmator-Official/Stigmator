"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  subscribeToNotifications,
  type Notification,
  type NotificationType,
} from "@/lib/api/notifications"

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  order_status: "📦",
  partnership_redeemed: "🤝",
  partnership_earning: "💰",
  manufacturer_update: "🏭",
  garment_approved: "✅",
  garment_rejected: "❌",
  deposit_recoup_complete: "🎉",
  message: "💬",
  message_received: "💬",
  mention: "👋",
  follow: "➕",
  collection_featured: "⭐",
  collection_added: "📚",
  design_reviewed: "🎨",
  review_received: "📝",
  partnership_invite: "📨",
  partnership_activated: "✨",
  system: "📢",
}

const PRIORITY_COLORS = {
  low: "text-[#6b8e6b]",
  normal: "text-[#e8f5e8]",
  high: "text-[#fbbf24]",
  urgent: "text-[#dc2626]",
}

export function NotificationCenter() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications({ limit: 20 })
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error("Error loading notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [loadNotifications])

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error marking notification read:", err)
    }
  }

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all notifications read:", err)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      const wasUnread = notifications.find((n) => n.id === id)?.read === false
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setIsOpen(false)
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-bold flex items-center justify-center rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[400px] bg-[#0a0f0a] border-[#1a2e1a] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a2e1a]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#4ade80]" />
            <span className="font-black tracking-tighter text-[#e8f5e8]">
              NOTIFICATIONS
            </span>
            {unreadCount > 0 && (
              <Badge className="bg-[#dc2626] text-white text-xs rounded-none">
                {unreadCount} NEW
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
            <Link href="/dashboard/notifications">
              <button className="text-xs text-[#4ade80] hover:underline font-mono">
                VIEW ALL
              </button>
            </Link>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-[#4ade80] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-[#6b8e6b]">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-4 border-b border-[#1a2e1a] cursor-pointer transition-colors ${
                  notification.read
                    ? "bg-[#0a0f0a] opacity-60"
                    : "bg-[#050805] hover:bg-[#1a2e1a]/50"
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-2xl">
                    {NOTIFICATION_ICONS[notification.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm ${
                        notification.read
                          ? "text-[#6b8e6b]"
                          : PRIORITY_COLORS[notification.priority]
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-sm text-[#a3c9a3] mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-[#6b8e6b] mt-2 font-mono">
                      {new Date(notification.created_at).toLocaleDateString()} •{" "}
                      {new Date(notification.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={(e) => handleMarkRead(e, notification.id)}
                      className="p-1.5 bg-[#1a2e1a] text-[#4ade80] hover:bg-[#4ade80] hover:text-black transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="p-1.5 bg-[#1a2e1a] text-[#6b8e6b] hover:bg-[#dc2626] hover:text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ade80]" />
                )}
              </div>
            ))}
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-[#1a2e1a] bg-[#050805]">
          <Link href="/dashboard/settings/notifications">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Notification Settings
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
