"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  AlertTriangle, 
  Home, 
  ArrowLeft, 
  Search, 
  Compass,
  Skull
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

/**
 * 404 Not Found Page
 * 
 * Brutalist design with helpful navigation options
 * Sharp edges, consistent with design system
 */
export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain flex items-center">
      <Container size="small" className="w-full">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute -top-20 -left-20 text-[200px] font-black text-[#dc2626]/[0.03] leading-none select-none pointer-events-none">
            404
          </div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Error message */}
            <div className="space-y-8">
              {/* Status code */}
              <div className="space-y-2">
                <span className="font-mono text-xs tracking-widest text-[#dc2626]">
                  [ERROR CODE]
                </span>
                <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-[#dc2626]">
                  404
                </h1>
              </div>

              {/* Error description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#dc2626]/10 border-2 border-[#dc2626] flex items-center justify-center">
                    <Skull className="h-6 w-6 text-[#dc2626]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-[#e8f5e8]">
                    PAGE NOT FOUND
                  </h2>
                </div>
                
                <p className="text-[#6b8e6b] text-lg max-w-md leading-relaxed">
                  The page you&apos;re looking for doesn&apos;t exist or has been moved. 
                  It might have been deleted, or the URL could be incorrect.
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="rounded-none border-2 border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80] h-12 font-mono"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  GO BACK
                </Button>
                
                <Link href="/">
                  <Button className="w-full sm:w-auto rounded-none bg-[#dc2626] hover:bg-[#b91c1c] text-white h-12 font-black tracking-wider border-2 border-[#dc2626] brutal-box">
                    <Home className="h-4 w-4 mr-2" />
                    RETURN HOME
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Navigation suggestions */}
            <div className="space-y-6">
              <h3 className="font-mono text-xs tracking-widest text-[#4ade80]">
                [POPULAR DESTINATIONS]
              </h3>
              
              <div className="space-y-3">
                <NavSuggestion 
                  href="/shop"
                  icon={Search}
                  title="BROWSE FLASH"
                  description="Discover tattoo designs from artists worldwide"
                />
                <NavSuggestion 
                  href="/artists"
                  icon={Compass}
                  title="FIND ARTISTS"
                  description="Connect with tattoo artists in your area"
                />
                <NavSuggestion 
                  href="/artist/apply"
                  icon={AlertTriangle}
                  title="JOIN AS ARTIST"
                  description="Start earning from your designs"
                />
              </div>

              {/* Help text */}
              <div className="p-4 border border-[#1a2e1a] bg-[#0a0f0a]">
                <p className="text-xs text-[#6b8e6b] font-mono leading-relaxed">
                  <span className="text-[#4ade80]">TIP:</span> If you believe this is an error, 
                  please contact our support team or try refreshing the page.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom decorative text */}
          <div className="mt-24 text-center overflow-hidden">
            <span className="text-[12vw] font-black text-[#4ade80]/[0.02] tracking-tighter whitespace-nowrap select-none">
              LOST IN THE VOID
            </span>
          </div>
        </div>
      </Container>
    </div>
  )
}

/**
 * Navigation suggestion card component
 */
function NavSuggestion({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <Link 
      href={href}
      className="group block p-4 border border-[#1a2e1a] bg-[#0a0f0a] hover:border-[#4ade80] transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 border border-[#1a2e1a] group-hover:border-[#4ade80] group-hover:bg-[#4ade80]/10 flex items-center justify-center transition-all">
          <Icon className="h-5 w-5 text-[#6b8e6b] group-hover:text-[#4ade80] transition-colors" />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-[#e8f5e8] group-hover:text-[#4ade80] transition-colors tracking-tight">
            {title}
          </h4>
          <p className="text-sm text-[#6b8e6b]">
            {description}
          </p>
        </div>
        <ArrowLeft className="h-5 w-5 text-[#1a2e1a] group-hover:text-[#4ade80] -rotate-180 transition-all group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
