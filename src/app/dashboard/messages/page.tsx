"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Send, Paperclip, MoreVertical, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  subscribeToMessages,
  createConversation,
  type Conversation,
  type Message,
} from "@/lib/api/messages"

const TYPE_ICONS: Record<Conversation["type"], string> = {
  order: "📦",
  garment: "👕",
  partnership: "🤝",
  general: "💬",
  dispute: "⚠️",
}

const TYPE_LABELS: Record<Conversation["type"], string> = {
  order: "Order",
  garment: "Garment",
  partnership: "Partnership",
  general: "General",
  dispute: "Dispute",
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error("Error loading conversations:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await getMessages(conversationId, { limit: 100 })
      setMessages(data.messages)
      await markConversationRead(conversationId)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      )
    } catch (err) {
      console.error("Error loading messages:", err)
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)

      const unsubscribe = subscribeToMessages(selectedConversation.id, (newMessage) => {
        setMessages((prev) => [...prev, newMessage])
      })

      return unsubscribe
    }
  }, [selectedConversation, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return

    setSending(true)
    try {
      await sendMessage({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      })
      setMessageInput("")
      // Refresh conversation list to update last message preview
      loadConversations()
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewConversation = async () => {
    // Placeholder - would open a dialog to select participants
    console.log("New conversation")
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  // Mobile conversation view
  if (isMobile && selectedConversation) {
    return (
      <div className="min-h-screen bg-[#050805]">
        {/* Mobile Header */}
        <div className="flex items-center gap-2 p-4 border-b border-[#1a2e1a] bg-[#0a0f0a] sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedConversation(null)}
            className="text-[#6b8e6b] hover:text-[#e8f5e8]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-2xl">{TYPE_ICONS[selectedConversation.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#e8f5e8] truncate">{selectedConversation.title}</p>
            <p className="text-xs text-[#6b8e6b]">
              {selectedConversation.participants.length} participants
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#6b8e6b]">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a2e1a] border-[#2a3e2a]">
              <DropdownMenuItem className="text-[#e8f5e8] hover:bg-[#0a0f0a]">
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#e8f5e8] hover:bg-[#0a0f0a]">
                Mute Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-140px)]">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1a2e1a] bg-[#0a0f0a] sticky bottom-0">
          <div className="flex gap-2">
            <button className="p-3 text-[#6b8e6b] hover:text-[#e8f5e8]">
              <Paperclip className="h-5 w-5" />
            </button>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] focus:border-[#4ade80] rounded-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sending}
              className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none px-4 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050805]">
      {/* Page Header */}
      <div className="border-b border-[#1a2e1a] px-6 py-4 bg-[#0a0f0a]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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
              MESSAGES
            </h1>
            {totalUnread > 0 && (
              <Badge className="bg-[#dc2626] text-white rounded-none">
                {totalUnread} UNREAD
              </Badge>
            )}
          </div>
          <Button
            onClick={handleNewConversation}
            className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold tracking-wider rounded-none"
          >
            NEW MESSAGE
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Conversation List */}
        <div className={`${selectedConversation && !isMobile ? "w-80 border-r" : "flex-1"} border-[#1a2e1a] bg-[#0a0f0a]`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#6b8e6b]">
              <div className="text-4xl mb-4">💬</div>
              <p className="font-bold">No conversations yet</p>
              <p className="text-sm mt-1">Messages appear when you have orders or partnerships</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 border-b border-[#1a2e1a] text-left transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? "bg-[#1a2e1a]"
                      : "hover:bg-[#1a2e1a]/30"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-[#1a2e1a] flex items-center justify-center text-2xl flex-shrink-0">
                      {TYPE_ICONS[conversation.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[#e8f5e8] truncate text-sm">
                          {conversation.title}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-[#dc2626] text-white text-xs rounded-none flex-shrink-0">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#6b8e6b] mt-1">
                        {TYPE_LABELS[conversation.type]}
                      </p>
                      {conversation.last_message_preview && (
                        <p className="text-sm text-[#6b8e6b] mt-1 truncate">
                          {conversation.last_message_preview}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          )}
        </div>

        {/* Message Area - Desktop only */}
        {!isMobile && selectedConversation && (
          <div className="flex-1 flex flex-col bg-[#050805]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a2e1a] bg-[#0a0f0a]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{TYPE_ICONS[selectedConversation.type]}</span>
                <div>
                  <p className="font-bold text-[#e8f5e8]">{selectedConversation.title}</p>
                  <p className="text-xs text-[#6b8e6b]">
                    {selectedConversation.participants.length} participants
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#6b8e6b]">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1a2e1a] border-[#2a3e2a]">
                  <DropdownMenuItem className="text-[#e8f5e8] hover:bg-[#0a0f0a]">
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[#e8f5e8] hover:bg-[#0a0f0a]">
                    Mute Notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-[#1a2e1a] bg-[#0a0f0a]">
              <div className="flex gap-2">
                <button className="p-3 text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] focus:border-[#4ade80] rounded-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none px-6 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - Desktop only */}
        {!isMobile && !selectedConversation && (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6b8e6b] bg-[#050805]">
            <div className="text-6xl mb-6">💬</div>
            <p className="text-xl font-bold text-[#a3c9a3]">Select a conversation</p>
            <p className="text-sm mt-2">Choose from the list to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const [isMe, setIsMe] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      setIsMe(data.user?.id === message.sender_id)
    })
  }, [message.sender_id])

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-[#1a2e1a] rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-[#6b8e6b]" />
            </div>
            <span className="text-xs text-[#6b8e6b]">{message.sender_name}</span>
          </div>
        )}
        <div
          className={`p-3 ${
            isMe
              ? "bg-[#4ade80] text-black"
              : "bg-[#1a2e1a] text-[#e8f5e8]"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-[10px] text-[#6b8e6b] mt-1">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
