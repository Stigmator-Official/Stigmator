"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart/cart-button"
import { UserMenu } from "./user-menu"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { MessageCenter } from "@/components/messages/message-center"
import { supabaseBrowser } from "@/lib/supabase/client"

const mainPaths = [
  { href: "/shop", label: "FLASH", sub: "Browse the sheets" },
  { href: "/artist/apply", label: "CREATE", sub: "Join the artists" },
  { href: "/competitions", label: "BATTLE", sub: "Enter the arena" },
  { href: "/partner", label: "EARN", sub: "Your ink pays rent" },
  { href: "/invite", label: "INVITE", sub: "Bring your artist" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Scroll hide/show state
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Check user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      try {
        const supabase = supabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoggedIn(!!session)
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsLoggedIn(false)
      }
      
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Scroll handler for shadow and hide/show behavior
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    
    // Set scrolled state for styling
    setScrolled(currentScrollY > 50)
    
    // Hide/show navbar based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down - hide
      setIsVisible(false)
    } else {
      // Scrolling up - show
      setIsVisible(true)
    }
    
    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav 
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 motion-reduce:transition-none ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled 
            ? "bg-[#080a08]/95 backdrop-blur-sm border-b border-[#1a2e1a] shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-36">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] rounded"
              aria-label="Stigmator Home"
            >
              <Image 
                src="/logo.webp" 
                alt="Stigmator" 
                width={160} 
                height={40} 
                className="h-32 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1" role="menubar">
              {mainPaths.map((path) => {
                const isActive = isActiveRoute(path.href)
                return (
                  <Link
                    key={path.href}
                    href={path.href}
                    role="menuitem"
                    className={`relative px-6 py-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] rounded ${isActive ? "border-b-2 border-[#4ade80]" : ""}`}
                    onMouseEnter={() => setHoveredPath(path.label)}
                    onMouseLeave={() => setHoveredPath(null)}

                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`text-xl font-black tracking-tighter transition-colors motion-reduce:transition-none ${
                        isActive 
                          ? "text-[#4ade80]" 
                          : hoveredPath === path.label 
                            ? "text-[#4ade80]" 
                            : "text-[#e8f5e8]"
                      }`}>
                        {path.label}
                      </span>
                      <span className={`text-[10px] tracking-widest uppercase transition-all font-mono motion-reduce:transition-none ${
                        hoveredPath === path.label || isActive
                          ? "opacity-100 text-[#4ade80] translate-y-0" 
                          : "opacity-0 -translate-y-1"
                      }`}>
                        {path.sub}
                      </span>
                    </div>
                    {/* Hover border effect */}
                    <div className={`absolute inset-0 border-2 border-[#4ade80] transition-all motion-reduce:transition-none ${
                      hoveredPath === path.label ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    } ${isActive ? "hidden" : ""}`} aria-hidden="true" />
                  </Link>
                )
              })}
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {isLoggedIn && !isLoading && (
                <>
                  <MessageCenter />
                  <NotificationCenter />
                </>
              )}
              <CartButton />
              
              {isLoading ? (
                // Loading state
                <div className="w-20 h-8 bg-[#1a2e1a]/50 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              ) : isLoggedIn ? (
                // Logged in - show user menu
                <UserMenu />
              ) : (
                // Logged out - show auth buttons
                <>
                  <Link 
                    href="/auth/login"
                    className="text-sm font-mono text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] rounded px-2 py-1"
                  >
                    [ACCESS]
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black tracking-wider px-6 py-2 rounded-none border-2 border-[#dc2626] brutal-box">
                      GET STIGMATIZED
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 lg:hidden">
              {isLoggedIn && !isLoading && (
                <>
                  <MessageCenter />
                  <NotificationCenter />
                </>
              )}
              <CartButton />
              {!isLoading && isLoggedIn && (
                <div className="mr-1">
                  <UserMenu />
                </div>
              )}
              <button 
                className="p-2 text-[#e8f5e8] hover:text-[#4ade80] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] rounded" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <X className="h-8 w-8" aria-hidden="true" /> : <Menu className="h-8 w-8" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <div 
        id="mobile-menu"
        className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-[320px] bg-[#080a08] z-50 lg:hidden transform transition-transform duration-300 ease-out motion-reduce:transition-none border-l border-[#1a2e1a] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-[#1a2e1a]">
          <span className="text-xl font-black tracking-tighter text-[#e8f5e8]">
            MENU
          </span>
          <button 
            className="p-2 text-[#e8f5e8] hover:text-[#4ade80] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] rounded"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto">
          {/* User Section (when logged in) */}
          {!isLoading && isLoggedIn && (
            <UserMenu isMobile onNavigate={() => setIsOpen(false)} />
          )}

          {/* Navigation Links */}
          <nav className="flex-1 py-4" aria-label="Mobile navigation">
            {mainPaths.map((path) => {
              const isActive = isActiveRoute(path.href)
              return (
                <Link 
                  key={path.href} 
                  href={path.href} 
                  className={`block px-4 py-3 border-l-2 transition-all motion-reduce:transition-none ${
                    isActive 
                      ? "border-[#4ade80] bg-[#1a2e1a]/30" 
                      : "border-transparent hover:border-[#6b8e6b] hover:bg-[#1a2e1a]/20"
                  }`}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={`block text-2xl font-black tracking-tighter transition-colors ${
                    isActive ? "text-[#4ade80]" : "text-[#e8f5e8]"
                  }`}>
                    {path.label}
                  </span>
                  <span className={`text-xs tracking-widest uppercase font-mono transition-colors ${
                    isActive ? "text-[#4ade80]" : "text-[#6b8e6b]"
                  }`}>
                    {path.sub}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Auth Section (when logged out) */}
          {!isLoading && !isLoggedIn && (
            <div className="p-4 border-t border-[#1a2e1a] space-y-3">
              <Link 
                href="/auth/login" 
                onClick={() => setIsOpen(false)}
                className="block w-full"
              >
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-2 border-[#6b8e6b] text-[#e8f5e8] hover:bg-[#1a2e1a] hover:border-[#4ade80] font-mono tracking-wider rounded-none h-12"
                >
                  [ACCESS]
                </Button>
              </Link>
              <Link 
                href="/auth/register" 
                onClick={() => setIsOpen(false)}
                className="block w-full"
              >
                <Button className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black tracking-wider rounded-none border-2 border-[#dc2626] h-12 brutal-box">
                  GET STIGMATIZED
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
