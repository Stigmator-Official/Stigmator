"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  type Notification,
  type NotificationType,
} from "@/lib/api/notifications"

const TYPE_ICONS: Record<NotificationType, string> = {
  order_status: "📦",
  partnership_invite: "📨",
  partnership_activated: "✨",
  partnership_redeemed: "🤝",
  partnership_earning: "💰",
  garment_approved: "👕",
  garment_rejected: "❌",
  deposit_recoup_complete: "💰",
  message_received: "💬",
  message: "💬",
  manufacturer_update: "🏭",
  design_reviewed: "⭐",
  review_received: "📝",
  follow: "👤",
  collection_added: "📚",
  collection_featured: "✨",
  mention: "👋",
  system: "📢",
}

const TYPE_COLORS: Record<NotificationType, { bg: string; border: string }> = {
  order_status: { bg: "bg-blue-500/10", border: "border-blue-500/30" },
  partnership_invite: { bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  partnership_activated: { bg: "bg-green-500/10", border: "border-green-500/30" },
  partnership_redeemed: { bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  partnership_earning: { bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  garment_approved: { bg: "bg-green-500/10", border: "border-green-500/30" },
  garment_rejected: { bg: "bg-red-500/10", border: "border-red-500/30" },
  deposit_recoup_complete: { bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  message_received: { bg: "bg-purple-500/10", border: "border-purple-500/30" },
  message: { bg: "bg-purple-500/10", border: "border-purple-500/30" },
  manufacturer_update: { bg: "bg-orange-500/10", border: "border-orange-500/30" },
  design_reviewed: { bg: "bg-pink-500/10", border: "border-pink-500/30" },
  review_received: { bg: "bg-teal-500/10", border: "border-teal-500/30" },
  follow: { bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  collection_added: { bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
  collection_featured: { bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
  mention: { bg: "bg-pink-500/10", border: "border-pink-500/30" },
  system: { bg: "bg-gray-500/10", border: "border-gray-500/30" },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUserNotifications({
        unreadOnly: filter === "unread",
        limit: 100,
      })
      setNotifications(result.notifications)
    } catch (err) {
      console.error("Error loading notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
    })

    return unsubscribe
  }, [])

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id)
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (err) {
      console.error("Error marking as read:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    setActionLoading("all")
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error("Error marking all as read:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error("Error deleting notification:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.read
  )

  return (
    <div className="min-h-screen bg-[#050805]">
      {/* Header */}
      <div className="border-b border-[#1a2e1a] px-6 py-4 bg-[#0a0f0a]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
              NOTIFICATIONS
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-[#dc2626] text-white rounded-none">
                {unreadCount} UNREAD
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading === "all"}
              variant="outline"
              className="border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 rounded-none"
            >
              {actionLoading === "all" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              MARK ALL READ
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              filter === "all"
                ? "bg-[#4ade80] text-black"
                : "bg-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
            }`}
          >
            ALL ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              filter === "unread"
                ? "bg-[#4ade80] text-black"
                : "bg-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
            }`}
          >
            UNREAD ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#1a2e1a]">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-[#6b8e6b] font-mono text-lg">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-sm text-[#6b8e6b]/70 mt-2">
              Notifications about orders, partnerships, and updates appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  actionLoading,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  actionLoading: string | null
}) {
  const colors = TYPE_COLORS[notification.type]
  const isLoading = actionLoading === notification.id

  return (
    <div
      className={`p-4 border transition-all ${
        notification.read
          ? "bg-[#0a0f0a] border-[#1a2e1a] opacity-70"
          : `${colors.bg} ${colors.border}`
      }`}
    >
      <div className="flex gap-4">
        <div className="text-3xl flex-shrink-0">{TYPE_ICONS[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#e8f5e8]">{notification.title}</h3>
              <p className="text-sm text-[#a3c9a3] mt-1">{notification.message}</p>
              <p className="text-xs text-[#6b8e6b] mt-2">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={isLoading}
                  className="text-[#4ade80] hover:text-[#4ade80] hover:bg-[#4ade80]/10"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              )}
              {notification.action_url && (
                <Link href={notification.action_url}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(notification.id)}
                disabled={isLoading}
                className="text-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
