"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Droplets, Zap, Target, DollarSign, Upload, Shirt, Building2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArtistDirectory } from "@/components/artist-directory/artist-directory"

export default function HomePage() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  // Scroll indicator visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY < 100)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen texture-grain texture-scan">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 top-1/4 rotate-90 text-[20vw] font-black text-[#4ade80]/[0.02] tracking-tighter whitespace-nowrap select-none will-change-transform">
            MARKED
          </div>
          <div className="absolute -left-20 bottom-1/4 -rotate-90 text-[20vw] font-black text-[#dc2626]/[0.02] tracking-tighter whitespace-nowrap select-none will-change-transform">
            EARN
          </div>
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto w-full">
          <div className="mb-8">
            <span className="inline-flex items-center space-x-2 font-mono text-xs tracking-widest text-[#4ade80] border border-[#4ade80]/30 px-4 py-2">
              <Droplets className="h-3 w-3" />
              <span>THE TATTOO ECONOMY REVOLUTION</span>
            </span>
          </div>

          <div className="space-y-2 mb-12">
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter text-[#e8f5e8] will-change-transform">
              YOUR SKIN
            </h1>
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#f97316] will-change-transform">
              ISN&apos;T THE
            </h1>
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter text-[#e8f5e8] will-change-transform">
              ONLY CANVAS
            </h1>
          </div>

          <div className="max-w-2xl mb-12 space-y-6">
            <p className="text-xl sm:text-2xl font-light leading-relaxed text-[#e8f5e8]">
              Tattoo artists mark you once. Stigmator lets you both <span className="text-[#4ade80] font-black">earn forever</span>.
            </p>
            <p className="text-xl sm:text-2xl font-light leading-relaxed text-[#a3c9a3]">
              Get the code. Share the design. Get paid when it sells.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button 
                size="lg" 
                className="group bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black tracking-wider px-8 py-6 text-lg rounded-none border-2 border-[#dc2626] brutal-box transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] will-change-transform"
              >
                BROWSE FLASH
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button 
                size="lg" 
                variant="outline" 
                className="group font-black tracking-wider px-8 py-6 text-lg rounded-none border-2 border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 transition-all duration-200 hover:scale-105 will-change-transform"
              >
                ACTIVATE YOUR INK
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-500 will-change-opacity ${
            showScrollIndicator ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="font-mono text-xs tracking-widest text-[#a3c9a3]">SCROLL</span>
          <div className="relative w-6 h-10 border-2 border-[#4ade80]/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-[#4ade80] rounded-full mt-2 animate-bounce" />
          </div>
          <ChevronDown className="h-4 w-4 text-[#4ade80] animate-pulse" />
        </div>
      </section>

      {/* EARLY ACCESS / STATS SECTION */}
      <section className="relative py-20 border-t border-[#1a2e1a] bg-[#0a0f0a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-12">
            <span className="font-mono text-xs tracking-widest text-[#4ade80] mb-4 block">[EARLY ACCESS]</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#e8f5e8]">
              BE PART OF THE <span className="text-[#dc2626]">FOUNDATION</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-[#1a2e1a] bg-[#0d120d]">
              <div className="text-5xl sm:text-6xl font-black text-[#4ade80] mb-2 tracking-tighter">
                NOW
              </div>
              <div className="font-mono text-sm tracking-widest text-[#a3c9a3]">ACCEPTING ARTISTS</div>
            </div>
            <div className="text-center p-8 border border-[#1a2e1a] bg-[#0d120d]">
              <div className="text-5xl sm:text-6xl font-black text-[#dc2626] mb-2 tracking-tighter">
                0
              </div>
              <div className="font-mono text-sm tracking-widest text-[#a3c9a3]">DESIGNS LIVE</div>
            </div>
            <div className="text-center p-8 border border-[#1a2e1a] bg-[#0d120d]">
              <div className="text-5xl sm:text-6xl font-black text-[#f97316] mb-2 tracking-tighter">
                YOU?
              </div>
              <div className="font-mono text-sm tracking-widest text-[#a3c9a3]">BE THE FIRST</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS SECTION */}
      <section className="relative py-32 border-t border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <span className="font-mono text-xs tracking-widest text-[#4ade80] mb-4 block">[FOR EVERYONE]</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#e8f5e8]">
              THREE WAYS TO <span className="text-[#dc2626]">EARN</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Artists */}
            <div className="group relative p-8 border border-[#1a2e1a] bg-[#0a0f0a] hover:border-[#4ade80]/50 transition-all duration-300 will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-14 h-14 border-2 border-[#4ade80] flex items-center justify-center mb-6 group-hover:bg-[#4ade80]/10 transition-colors duration-300">
                  <Upload className="h-7 w-7 text-[#4ade80]" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-3 text-[#e8f5e8]">
                  FOR ARTISTS
                </h3>
                <p className="text-[#a3c9a3] text-lg mb-4">Upload & Earn</p>
                <p className="text-[#a3c9a3]/80 leading-relaxed">
                  Upload your flash designs. Set your prices. Create partnership codes for clients. Earn on every sale.
                </p>
              </div>
            </div>

            {/* For Collectors */}
            <div className="group relative p-8 border border-[#1a2e1a] bg-[#0a0f0a] hover:border-[#dc2626]/50 transition-all duration-300 will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-14 h-14 border-2 border-[#dc2626] flex items-center justify-center mb-6 group-hover:bg-[#dc2626]/10 transition-colors duration-300">
                  <Shirt className="h-7 w-7 text-[#dc2626]" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-3 text-[#e8f5e8]">
                  FOR COLLECTORS
                </h3>
                <p className="text-[#a3c9a3] text-lg mb-4">Wear & Earn</p>
                <p className="text-[#a3c9a3]/80 leading-relaxed">
                  Get your tattoo code from your artist. Activate it. Buy merch featuring your ink. Earn royalties forever.
                </p>
              </div>
            </div>

            {/* For Partners */}
            <div className="group relative p-8 border border-[#1a2e1a] bg-[#0a0f0a] hover:border-[#f97316]/50 transition-all duration-300 will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-14 h-14 border-2 border-[#f97316] flex items-center justify-center mb-6 group-hover:bg-[#f97316]/10 transition-colors duration-300">
                  <Building2 className="h-7 w-7 text-[#f97316]" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-3 text-[#e8f5e8]">
                  FOR PARTNERS
                </h3>
                <p className="text-[#a3c9a3] text-lg mb-4">Ink & Earn</p>
                <p className="text-[#a3c9a3]/80 leading-relaxed">
                  Tattoo shops, brands, and collaborators. Access our artist network. Create co-branded collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EQUITY INK SECTION */}
      <section className="relative py-32 border-t border-[#1a2e1a] bg-[#0a0f0a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16">
          <span className="font-mono text-xs tracking-widest text-[#4ade80] mb-4 block">[EQUITY INK PROTOCOL]</span>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-[#e8f5e8]">
            YOUR TATTOO
            <br />
            <span className="text-[#dc2626]">PAYS</span>
            <br />
            YOU BACK
          </h2>
          
          <p className="text-xl text-[#a3c9a3] mb-8 max-w-lg">
            The world&apos;s first platform where tattoo collectors become partners. 
            Get a code from your artist. Activate it. Earn forever.
          </p>
          
          <div className="space-y-4 mb-8">
            {[
              "Artist creates partnership code for your tattoo",
              "You activate the code on Stigmator",
              "Set your revenue split (15-25%)",
              "Earn on every sale worldwide",
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 font-mono text-sm text-[#e8f5e8]">
                <span className="text-[#4ade80] mt-1">-</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Link href="/partner">
              <Button className="group bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black tracking-wider px-8 py-6 text-lg rounded-none border-2 border-[#dc2626] brutal-box transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] will-change-transform">
                ACTIVATE YOUR INK
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/artist/partnerships">
              <Button variant="outline" className="group rounded-none border-2 border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 font-black tracking-wider px-8 py-6 text-lg transition-all duration-200 hover:scale-105 will-change-transform">
                CREATE CODES
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-32 px-4 sm:px-8 lg:px-16 border-t border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20">
            <div>
              <span className="font-mono text-xs tracking-widest text-[#4ade80] mb-4 block">[THE PROCESS]</span>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-[#e8f5e8]">
                FROM SKIN
                <br />
                <span className="text-[#a3c9a3]">TO FABRIC</span>
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { num: "01", icon: Target, title: "ARTIST MARKS", desc: "Create the tattoo. Generate a partnership code. Set the split.", color: "#dc2626" },
              { num: "02", icon: Zap, title: "CLIENT ACTIVATES", desc: "Enter the code. Become a partner. Own a piece of the commercial rights.", color: "#4ade80" },
              { num: "03", icon: DollarSign, title: "BOTH EARN", desc: "Design sells on merch. Revenue splits instantly. Forever.", color: "#f97316" },
            ].map((step, i) => (
              <div 
                key={i} 
                className={`group relative p-8 border border-[#1a2e1a] bg-[#0a0f0a] hover:border-[#dc2626]/50 transition-all duration-500 will-change-transform ${i === 1 ? "lg:translate-y-12" : ""}`}
              >
                <div className="absolute -top-6 -left-2 text-[120px] font-black text-[#4ade80]/[0.03] leading-none select-none will-change-transform">{step.num}</div>
                <div className="relative z-10">
                  <step.icon className="h-8 w-8 mb-6 transition-transform duration-300 group-hover:scale-110" style={{ color: step.color }} />
                  <h3 className="text-2xl font-black tracking-tighter mb-4 text-[#e8f5e8]">{step.title}</h3>
                  <p className="text-[#a3c9a3]/80 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTIST DIRECTORY */}
      <ArtistDirectory />

      {/* CTA */}
      <section className="relative py-32 px-4 sm:px-8 lg:px-16 border-t border-[#1a2e1a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-[#e8f5e8]">
            READY TO
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc2626] to-[#f97316]">
              GET MARKED?
            </span>
          </h2>
          <p className="text-xl text-[#a3c9a3] max-w-2xl mx-auto mb-12">
            Join the revolution. Your tattoo is an asset. Start earning from it today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <Button className="group bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black tracking-wider px-12 py-6 text-lg rounded-none border-2 border-[#dc2626] brutal-box transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] will-change-transform">
                ENTER THE SHOP
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="group font-black tracking-wider px-12 py-6 text-lg rounded-none border-2 border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 transition-all duration-200 hover:scale-105 will-change-transform">
                GET MARKED
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
