"use client"

import { supabaseBrowser } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export type ParticipantRole = "artist" | "customer" | "manufacturer" | "admin"

export type Conversation = {
  id: string
  type: "order" | "garment" | "partnership" | "general" | "dispute"
  title: string
  reference_id?: string
  participants: {
    id: string
    name: string
    role: ParticipantRole
    avatar?: string
  }[]
  last_message_preview?: string
  last_message_sender?: string
  last_message_at: string
  unread_count: number
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_role: ParticipantRole
  content: string
  attachments?: string[]
  created_at: string
}

export type SendMessageInput = {
  conversationId: string
  content: string
  attachments?: string[]
}

const getCurrentUser = async () => {
  const supabase = supabaseBrowser()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Send a message
export async function sendMessage(input: SendMessageInput): Promise<Message> {
  const supabase = supabaseBrowser()
  const user = await getCurrentUser()
  
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("messages")
    .insert({
      id: uuidv4(),
      conversation_id: input.conversationId,
      sender_id: user.id,
      sender_type: "artist", // Will be determined from user profile
      content: input.content,
      attachments: input.attachments || [],
      read_by: [user.id],
    })
    .select()
    .single()

  if (error) throw error

  // Update conversation last_message
  await supabase
    .from("conversations")
    .update({
      last_message_preview: input.content.slice(0, 100),
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.conversationId)

  return {
    id: data.id,
    conversation_id: data.conversation_id,
    sender_id: data.sender_id,
    sender_name: "You",
    sender_role: "artist",
    content: data.content,
    attachments: data.attachments,
    created_at: data.created_at,
  }
}

// Get user's conversations
export async function getConversations(): Promise<Conversation[]> {
  const supabase = supabaseBrowser()
  const user = await getCurrentUser()
  
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      conversation:conversations!conversation_id(
        id,
        type,
        title,
        reference_id,
        last_message_preview,
        last_message_at,
        created_at,
        updated_at,
        participants:conversation_participants(
          user_id,
          role,
          user:profiles!user_id(full_name, avatar_url)
        )
      ),
      unread_count
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
    return []
  }

  return data.map((item: any) => ({
    id: item.conversation.id,
    type: item.conversation.type,
    title: item.conversation.title,
    reference_id: item.conversation.reference_id,
    participants: item.conversation.participants.map((p: any) => ({
      id: p.user_id,
      name: p.user?.full_name || "Unknown",
      role: p.role,
      avatar: p.user?.avatar_url,
    })),
    last_message_preview: item.conversation.last_message_preview,
    last_message_sender: item.conversation.last_message_sender,
    last_message_at: item.conversation.last_message_at,
    unread_count: item.unread_count || 0,
    created_at: item.conversation.created_at,
    updated_at: item.conversation.updated_at,
  }))
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
): Promise<{ messages: Message[]; hasMore: boolean }> {
  const supabase = supabaseBrowser()
  const user = await getCurrentUser()
  
  if (!user) throw new Error("Not authenticated")

  let query = supabase
    .from("messages")
    .select(`
      id,
      conversation_id,
      sender_id,
      sender_type,
      content,
      attachments,
      created_at,
      sender:profiles!sender_id(full_name)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.before) {
    query = query.lt("created_at", options.before)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching messages:", error)
    return { messages: [], hasMore: false }
  }

  const messages = data.map((m: any) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    sender_name: m.sender?.full_name || "Unknown",
    sender_role: m.sender_type as ParticipantRole,
    content: m.content,
    attachments: m.attachments,
    created_at: m.created_at,
  }))

  return {
    messages,
    hasMore: data.length === (options?.limit || 50),
  }
}

// Mark conversation as read
export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = supabaseBrowser()
  const user = await getCurrentUser()
  
  if (!user) throw new Error("Not authenticated")

  // Mark all messages as read
  await supabase.rpc("mark_messages_read", {
    p_conversation_id: conversationId,
    p_user_id: user.id,
  })

  // Reset unread count
  await supabase
    .from("conversation_participants")
    .update({ unread_count: 0 })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
}

// Subscribe to real-time messages
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
): () => void {
  const supabase = supabaseBrowser()

  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload: { new: { id: string; conversation_id: string; sender_id: string; sender_type: ParticipantRole; content: string; attachments: string[]; created_at: string } }) => {
        // Fetch sender details
        const { data: sender } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", payload.new.sender_id)
          .single()

        callback({
          id: payload.new.id,
          conversation_id: payload.new.conversation_id,
          sender_id: payload.new.sender_id,
          sender_name: sender?.full_name || "Unknown",
          sender_role: payload.new.sender_type,
          content: payload.new.content,
          attachments: payload.new.attachments,
          created_at: payload.new.created_at,
        })
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Get unread message count
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = supabaseBrowser()
  const user = await getCurrentUser()
  
  if (!user) return 0

  const { data, error } = await supabase
    .from("conversation_participants")
    .select("unread_count")
    .eq("user_id", user.id)

  if (error) {
    console.error("Error getting unread count:", error)
    return 0
  }

  return data.reduce((sum: number, item: { unread_count?: number }) => sum + (item.unread_count || 0), 0)
}

// Create a new conversation
export async function createConversation(
  type: Conversation["type"],
  title: string,
  participantIds: string[],
  referenceId?: string
): Promise<Conversation> {
  const supabase = supabaseBrowser()
  const user = await getCurrentUser()
  
  if (!user) throw new Error("Not authenticated")

  // Create conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      id: uuidv4(),
      type,
      title,
      reference_id: referenceId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  // Add participants
  const allParticipants = [...new Set([user.id, ...participantIds])]
  const participantInserts = allParticipants.map((pid) => ({
    conversation_id: conversation.id,
    user_id: pid,
    role: pid === user.id ? "artist" : "customer",
  }))

  await supabase.from("conversation_participants").insert(participantInserts)

  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    reference_id: conversation.reference_id,
    participants: [],
    unread_count: 0,
    last_message_at: conversation.created_at,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
  }
}
