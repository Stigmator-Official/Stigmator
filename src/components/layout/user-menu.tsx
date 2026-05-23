"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, LogOut, LayoutDashboard, MessageSquare, Bell } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { type UserRole } from "@/lib/permissions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OptimizedAvatar } from "@/components/ui/optimized-image"

interface UserData {
  id: string
  name: string
  email?: string
  role: UserRole
  avatar?: string
}

// Role display mapping
const ROLE_DISPLAY: Record<UserRole, string> = {
  artist: "ARTIST",
  customer: "COLLECTOR",
  fulfillment: "MAKER",
  admin: "ADMIN",
}

// Role badge colors
const ROLE_COLORS: Record<UserRole, string> = {
  artist: "bg-[#dc2626] border-[#dc2626]",
  customer: "bg-[#4ade80] border-[#4ade80] text-[#0a0f0a]",
  fulfillment: "bg-[#6b8e6b] border-[#6b8e6b]",
  admin: "bg-[#fbbf24] border-[#fbbf24] text-[#0a0f0a]",
}

interface UserMenuProps {
  isMobile?: boolean
  onNavigate?: () => void
}

export function UserMenu({ isMobile = false, onNavigate }: UserMenuProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true)

      // Check Supabase session
      try {
        const supabase = supabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Fetch role from database for security (never trust client-side storage)
          const { data: userData } = await supabase
            .from("users")
            .select("role, full_name")
            .eq("id", session.user.id)
            .single()
          
          setUser({
            id: session.user.id,
            name: userData?.full_name || 
                  session.user.user_metadata?.full_name || 
                  session.user.email?.split("@")[0] || 
                  "User",
            email: session.user.email,
            role: (userData?.role as UserRole) || "customer",
            avatar: session.user.user_metadata?.avatar_url,
          })
        }
      } catch {
        // Silently fail - no sensitive data logged
      }

      setIsLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        const supabase = supabaseBrowser()
        const { data: userData } = await supabase
          .from("users")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single()
        
        setUser({
          id: session.user.id,
          name: userData?.full_name || 
                session.user.user_metadata?.full_name || 
                session.user.email?.split("@")[0] || 
                "User",
          email: session.user.email,
          role: (userData?.role as UserRole) || "customer",
          avatar: session.user.user_metadata?.avatar_url,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    // Sign out from Supabase
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
    } catch {
      // Silently fail
    }

    setUser(null)
    onNavigate?.()
    router.push("/")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#1a2e1a] animate-pulse motion-reduce:animate-none" aria-hidden="true" />
    )
  }

  if (!user) return null

  // Mobile version - shown in mobile menu
  if (isMobile) {
    return (
      <div className="w-full border-b border-[#1a2e1a] pb-4 mb-4">
        <div className="flex items-center gap-3 px-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#1a2e1a] border-2 border-[#4ade80] flex items-center justify-center overflow-hidden">
            <OptimizedAvatar
              src={user.avatar || null}
              alt={user.name}
              size="lg"
              className="w-full h-full"
            />
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <p className="text-[#e8f5e8] font-bold truncate">{user.name}</p>
            <span className={`inline-block px-2 py-0.5 text-[10px] font-black tracking-wider border ${ROLE_COLORS[user.role]}`}>
              {ROLE_DISPLAY[user.role]}
            </span>
          </div>
        </div>

        {/* Mobile Menu Links */}
        <nav className="mt-4 space-y-1 px-4" aria-label="User menu">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] rounded"
          >
            <LayoutDashboard className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-sm">DASHBOARD</span>
          </Link>
          <Link
            href="/dashboard/messages"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] rounded"
          >
            <MessageSquare className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-sm">MESSAGES</span>
          </Link>
          <Link
            href="/dashboard/notifications"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] rounded"
          >
            <Bell className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-sm">NOTIFICATIONS</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] rounded"
          >
            <Settings className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-sm">SETTINGS</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#dc2626] hover:bg-[#1a2e1a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] rounded text-left"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span className="font-mono text-sm">LOGOUT</span>
          </button>
        </nav>
      </div>
    )
  }

  // Desktop version - dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] rounded p-0.5"
          aria-label={`User menu for ${user.name}`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#1a2e1a] border-2 border-[#4ade80] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#22c55e] group-hover:shadow-[0_0_10px_rgba(74,222,128,0.3)] motion-reduce:transition-none">
            <OptimizedAvatar
              src={user.avatar || null}
              alt={user.name}
              size="md"
              className="w-full h-full"
            />
          </div>
          
          {/* Role Badge (small) */}
          <span className={`hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-black tracking-wider border ${ROLE_COLORS[user.role]}`}>
            {ROLE_DISPLAY[user.role]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-[#0a0f0a] border-[#1a2e1a] rounded-none shadow-[4px_4px_0px_0px_rgba(26,46,26,0.5)]">
        {/* User Header */}
        <div className="px-3 py-3 border-b border-[#1a2e1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a2e1a] border-2 border-[#4ade80] flex items-center justify-center overflow-hidden">
              <OptimizedAvatar
                src={user.avatar || null}
                alt={user.name}
                size="md"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#e8f5e8] truncate">{user.name}</p>
              <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-black tracking-wider border ${ROLE_COLORS[user.role]}`}>
                {ROLE_DISPLAY[user.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <div className="flex items-center gap-2 py-2.5 cursor-pointer">
            <LayoutDashboard className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-xs tracking-wider">DASHBOARD</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/dashboard/messages")}>
          <div className="flex items-center gap-2 py-2.5 cursor-pointer">
            <MessageSquare className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-xs tracking-wider">MESSAGES</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
          <div className="flex items-center gap-2 py-2.5 cursor-pointer">
            <Bell className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-xs tracking-wider">NOTIFICATIONS</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <div className="flex items-center gap-2 py-2.5 cursor-pointer">
            <Settings className="w-4 h-4 text-[#4ade80]" aria-hidden="true" />
            <span className="font-mono text-xs tracking-wider">SETTINGS</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#1a2e1a]" />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 py-2.5 text-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span className="font-mono text-xs tracking-wider">LOGOUT</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
