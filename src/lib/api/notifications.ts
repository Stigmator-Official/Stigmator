"use client"

import { supabaseBrowser } from "@/lib/supabase/client"

export type NotificationType = 
  | "order_status"           // Order updates
  | "partnership_redeemed"   // Someone redeemed your code
  | "partnership_earning"    // You earned from a partnership
  | "manufacturer_update"    // Manufacturer status change
  | "garment_approved"       // Garment went live
  | "garment_rejected"       // Garment rejected
  | "deposit_recoup_complete" // Recoup phase ended
  | "message_received"       // New message
  | "message"                // New message (legacy)
  | "mention"                // @mentioned in comment
  | "follow"                 // Someone followed you
  | "collection_featured"    // Design featured in collection
  | "collection_added"       // Design added to collection
  | "design_reviewed"        // Design reviewed
  | "review_received"        // Review received
  | "partnership_invite"     // Partnership invite
  | "partnership_activated"  // Partnership activated
  | "system"                 // Platform announcements

export type NotificationPriority = "low" | "normal" | "high" | "urgent"

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  read: boolean
  action_url?: string
  action_text?: string
  metadata?: {
    order_id?: string
    garment_id?: string
    design_id?: string
    partnership_id?: string
    sender_id?: string
    sender_name?: string
    amount?: number
    [key: string]: any
  }
  created_at: string
  expires_at?: string
}

export type NotificationPreferences = {
  email_notifications: boolean
  push_notifications: boolean
  order_updates: boolean
  partnership_updates: boolean
  manufacturer_updates: boolean
  earnings_updates: boolean
  community_updates: boolean
  marketing_emails: boolean
  digest_frequency: "realtime" | "daily" | "weekly"
}

export async function getNotifications(
  options?: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
    types?: NotificationType[]
  }
): Promise<{ notifications: Notification[]; unreadCount: number; total: number }> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (options?.unreadOnly) {
    query = query.eq("read", false)
  }

  if (options?.types?.length) {
    query = query.in("type", options.types)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  return {
    notifications: data || [],
    unreadCount: unreadCount || 0,
    total: count || 0,
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = supabaseBrowser()

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)

  if (error) {
    console.error("Error marking notification read:", error)
    throw error
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("Error marking all notifications read:", error)
    throw error
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = supabaseBrowser()

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)

  if (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching notification preferences:", error)
    throw error
  }

  // Return defaults if not set
  return data || {
    email_notifications: true,
    push_notifications: true,
    order_updates: true,
    partnership_updates: true,
    manufacturer_updates: true,
    earnings_updates: true,
    community_updates: true,
    marketing_emails: false,
    digest_frequency: "realtime",
  }
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error("Error updating notification preferences:", error)
    throw error
  }
}

// Real-time subscription helper
export function subscribeToNotifications(
  onNotification: (notification: Notification) => void
) {
  const supabase = supabaseBrowser()

  const channel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload: { new: Notification }) => {
        onNotification(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Helper to create notifications (server-side mostly)
export async function createNotification(input: {
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  action_url?: string
  action_text?: string
  metadata?: any
  expires_at?: string
}): Promise<Notification> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...input,
      priority: input.priority || "normal",
      read: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating notification:", error)
    throw error
  }

  return data
}

// Aliases for backward compatibility
export { getNotifications as getUserNotifications }
export { markNotificationRead as markAsRead }
export { markAllNotificationsRead as markAllAsRead }
