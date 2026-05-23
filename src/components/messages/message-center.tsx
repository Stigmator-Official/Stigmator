"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { MessageSquare, Loader2, Send, Paperclip, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  subscribeToMessages,
  type Conversation,
  type Message,
} from "@/lib/api/messages"

const CONVERSATION_TYPE_ICONS: Record<Conversation["type"], string> = {
  order: "📦",
  garment: "👕",
  partnership: "🤝",
  general: "💬",
  dispute: "⚠️",
}

const CONVERSATION_TYPE_LABELS: Record<Conversation["type"], string> = {
  order: "Order",
  garment: "Garment",
  partnership: "Partnership",
  general: "General",
  dispute: "Dispute",
}

export function MessageCenter() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  const loadConversations = useCallback(async () => {
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
      const data = await getMessages(conversationId, { limit: 50 })
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

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowConversationList(false)
    loadMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return

    try {
      await sendMessage({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      })
      setMessageInput("")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
          <MessageSquare className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-bold flex items-center justify-center rounded-full">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[450px] h-[600px] bg-[#0a0f0a] border-[#1a2e1a] p-0 overflow-hidden"
      >
        {selectedConversation && !showConversationList ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a2e1a] bg-[#050805]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConversationList(true)}
                  className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-2xl">
                  {CONVERSATION_TYPE_ICONS[selectedConversation.type]}
                </span>
                <div>
                  <p className="font-bold text-[#e8f5e8]">{selectedConversation.title}</p>
                  <p className="text-xs text-[#6b8e6b]">
                    {CONVERSATION_TYPE_LABELS[selectedConversation.type]} •{" "}
                    {selectedConversation.participants.length} participants
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMe = message.sender_role !== "manufacturer" // Simplified check
                  return (
                    <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && (
                          <p className="text-xs text-[#6b8e6b] mb-1">
                            <span className="font-medium text-[#a3c9a3]">
                              {message.sender_name}
                            </span>
                          </p>
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
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-[#1a2e1a] bg-[#050805]">
              <div className="flex gap-2">
                <button className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] focus:border-[#4ade80] rounded-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none px-3 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a2e1a]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#4ade80]" />
                <span className="font-black tracking-tighter text-[#e8f5e8]">
                  MESSAGES
                </span>
                {totalUnread > 0 && (
                  <Badge className="bg-[#dc2626] text-white text-xs rounded-none">
                    {totalUnread} UNREAD
                  </Badge>
                )}
              </div>
              <Link href="/dashboard/messages">
                <button className="text-xs text-[#4ade80] hover:underline font-mono">
                  VIEW ALL
                </button>
              </Link>
            </div>

            {/* Conversations List */}
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-6 w-6 text-[#4ade80] animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-[#6b8e6b]">
                <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Messages about orders and partnerships appear here</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="w-full p-4 border-b border-[#1a2e1a] hover:bg-[#1a2e1a]/30 transition-colors text-left"
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">
                        {CONVERSATION_TYPE_ICONS[conversation.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#e8f5e8] truncate">
                            {conversation.title}
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-[#dc2626] text-white text-xs rounded-none">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#6b8e6b] mt-1">
                          {CONVERSATION_TYPE_LABELS[conversation.type]} •{" "}
                          {new Date(conversation.last_message_at).toLocaleDateString()}
                        </p>
                        {conversation.last_message_preview && (
                          <p className="text-sm text-[#a3c9a3] mt-1 truncate">
                            <span className="text-[#6b8e6b]">
                              {conversation.last_message_sender}:
                            </span>{" "}
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
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
