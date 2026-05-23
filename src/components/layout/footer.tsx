"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Instagram, Twitter, ArrowUp, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Container } from "./container"
import { cn } from "@/lib/utils"

const footerLinks = {
  flash: [
    { href: "/shop", label: "All Sheets" },
    { href: "/artists", label: "Browse Artists" },
  ],
  create: [
    { href: "/artist/apply", label: "Join as Artist" },
    { href: "/artist/designs/upload", label: "Upload Design" },
  ],
  earn: [
    { href: "/partner", label: "Activate Ink" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  system: [
    { href: "/about", label: "The Manifesto" },
    { href: "/auth/login", label: "Login" },
    { href: "/auth/register", label: "Register" },
  ],
}

const socialLinks = [
  { 
    href: "https://instagram.com/stigmator", 
    label: "Instagram",
    icon: Instagram 
  },
  { 
    href: "https://twitter.com/stigmator", 
    label: "Twitter",
    icon: Twitter 
  },
]

/**
 * Footer component with:
 * - Consistent max-width (1800px)
 * - Active link states based on current path
 * - Back to top functionality
 * - Proper hover states for all interactive elements
 * - Brutalist aesthetic with sharp edges
 */
export function Footer() {
  const pathname = usePathname()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="border-t border-[#1a2e1a] bg-[#050805]">
      <Container className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6 group">
              <Image 
                src="/logo.webp" 
                alt="Stigmator" 
                width={180} 
                height={45} 
                className="h-40 w-auto object-contain"
              />
            </Link>
            <p className="text-[#6b8e6b] text-sm max-w-xs mb-6 font-mono leading-relaxed">
              THE TATTOO ECONOMY REVOLUTION.
              WHERE ARTISTS AND COLLECTORS BOTH EARN.
            </p>
            
            {/* Social links with enhanced hover states */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "group w-10 h-10",
                    "border border-[#1a2e1a]",
                    "flex items-center justify-center",
                    "hover:border-[#4ade80] hover:bg-[#4ade80]/10",
                    "transition-all duration-200",
                    "relative overflow-hidden"
                  )}
                >
                  <social.icon className="h-4 w-4 text-[#6b8e6b] group-hover:text-[#4ade80] transition-colors relative z-10" />
                  <ExternalLink className="h-2 w-2 text-[#4ade80] absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Flash links */}
          <FooterLinkGroup 
            title="FLASH" 
            links={footerLinks.flash} 
            pathname={pathname}
          />

          {/* Create links */}
          <FooterLinkGroup 
            title="CREATE" 
            links={footerLinks.create} 
            pathname={pathname}
          />

          {/* Earn links */}
          <FooterLinkGroup 
            title="EARN" 
            links={footerLinks.earn} 
            pathname={pathname}
          />

          {/* System links */}
          <FooterLinkGroup 
            title="SYSTEM" 
            links={footerLinks.system} 
            pathname={pathname}
          />
        </div>

        {/* Bottom section */}
        <div className="border-t border-[#1a2e1a] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-[#6b8e6b]">
            © {new Date().getFullYear()} STIGMATOR. ALL RIGHTS RESERVED.
          </p>
          
          <div className="flex items-center gap-6">
            {/* System status */}
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#4ade80] animate-pulse" />
              <span className="text-xs font-mono text-[#6b8e6b]">SYSTEM OPERATIONAL</span>
            </div>
            
            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className={cn(
                "group flex items-center gap-2",
                "text-xs font-mono text-[#6b8e6b]",
                "hover:text-[#4ade80] transition-colors"
              )}
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="h-3 w-3 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Large decorative text */}
        <div className="mt-16 text-center overflow-hidden">
          <span className="text-[15vw] font-black text-[#4ade80]/[0.02] tracking-tighter whitespace-nowrap select-none">
            GET MARKED
          </span>
        </div>
      </Container>
    </footer>
  )
}

/**
 * Footer link group component with active state support
 */
function FooterLinkGroup({
  title,
  links,
  pathname,
}: {
  title: string
  links: { href: string; label: string }[]
  pathname: string
}) {
  return (
    <div>
      <h3 className="font-black text-sm tracking-widest mb-6 text-[#4ade80]">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
          
          return (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className={cn(
                  "group flex items-center gap-2",
                  "text-sm font-mono",
                  "transition-colors duration-200",
                  isActive 
                    ? "text-[#4ade80] font-bold" 
                    : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                )}
              >
                {/* Active indicator */}
                <span className={cn(
                  "w-1 h-1 transition-all duration-200",
                  isActive 
                    ? "bg-[#4ade80]" 
                    : "bg-transparent group-hover:bg-[#6b8e6b]"
                )} />
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
