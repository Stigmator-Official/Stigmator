"use client"

import Link from "next/link"
import { Droplets, Heart, Globe, Zap, Shield, Skull, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

const values = [
  {
    icon: Heart,
    title: "ARTIST FIRST",
    description: "We believe tattoo artists are the soul of this platform. They receive the majority of every sale and full creative control.",
  },
  {
    icon: Globe,
    title: "GLOBAL COMMUNITY",
    description: "Connect artists and collectors from every corner of the world. Art knows no borders.",
  },
  {
    icon: Target,
    title: "QUALITY ABOVE ALL",
    description: "Every garment is crafted with care by skilled fulfillment partners. No mass production, no compromises.",
  },
  {
    icon: Zap,
    title: "CONSTANT INNOVATION",
    description: "From design tools to competition mechanics, we're always pushing boundaries to empower our community.",
  },
  {
    icon: Shield,
    title: "VERIFIED STUDIOS",
    description: "Our verification process ensures only legitimate, talented artists and reputable studios join the platform.",
  },
  {
    icon: Skull,
    title: "REVOLUTIONARY SPIRIT",
    description: "We're not just selling clothes. We're challenging the status quo of fast fashion and bringing art to the forefront.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      {/* Hero */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <div className="max-w-4xl">
            <span className="font-mono text-xs tracking-widest text-red-500 mb-4 block">
              THE MANIFESTO
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8">
              CLOTHING SHOULD
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                HAVE SOUL
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              STIGMATOR was born from a simple question: What if the world's most talented 
              artists had a platform to share their art on something more accessible than skin?
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 sm:px-8 lg:px-16 py-24 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-mono text-xs tracking-widest text-red-500 mb-4 block">
                THE MISSION
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-8">
                WE'RE NOT JUST
                <br />
                SELLING CLOTHES
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Tattoo artists pour their heart and soul into every design. Yet for decades, 
                  their art has been confined to the skin of those lucky enough to sit in their chair.
                </p>
                <p>
                  We believe that art should be shared, celebrated, and accessible. But more importantly, 
                  we believe artists deserve to be compensated fairly for their creativity.
                </p>
                <p>
                  STIGMATOR bridges the gap between tattoo culture and fashion, creating a new 
                  category of apparel: wearable masterpieces. Each piece tells a story, supports 
                  an artist, and makes a statement.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-red-950/30 to-black border border-white/10 flex items-center justify-center">
                <Droplets className="h-48 w-48 text-red-600/20" />
              </div>
              <div className="absolute -bottom-4 -right-4 stamp text-2xl">
                REVOLT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-8 lg:px-16 py-24 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <span className="font-mono text-xs tracking-widest text-red-500 mb-4 block">
            OUR VALUES
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-16">
            PRINCIPLES THAT
            <br />
            <span className="text-muted-foreground">GUIDE US</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, i) => (
              <div
                key={i}
                className="p-6 border border-white/5 bg-white/[0.02] hover:border-red-600/30 transition-colors group"
              >
                <value.icon className="h-8 w-8 text-red-600 mb-4" />
                <h3 className="text-xl font-black tracking-tighter mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="px-4 sm:px-8 lg:px-16 py-24 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <span className="font-mono text-xs tracking-widest text-red-500 mb-4 block">
            THE DIFFERENCE
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-16">
            HOW WE'RE
            <br />
            <span className="text-muted-foreground">DIFFERENT</span>
          </h2>

          <div className="space-y-24">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="text-6xl font-black text-red-600/20 mb-4">01</div>
                <h3 className="text-3xl font-black tracking-tighter mb-4">
                  MADE TO ORDER
                </h3>
                <p className="text-muted-foreground text-lg">
                  Every garment is created specifically for the customer who ordered it. 
                  This means zero waste from unsold inventory and a unique piece crafted 
                  with care by skilled fulfillment partners.
                </p>
              </div>
              <div className="order-1 lg:order-2 aspect-video bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <span className="text-6xl">🧵</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="aspect-video bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <span className="text-6xl">💰</span>
              </div>
              <div>
                <div className="text-6xl font-black text-red-600/20 mb-4">02</div>
                <h3 className="text-3xl font-black tracking-tighter mb-4">
                  ARTISTS EARN 70%
                </h3>
                <p className="text-muted-foreground text-lg">
                  While traditional marketplaces might give artists 10-20%, we flip the script. 
                  Artists keep the majority of every sale because we believe their creativity 
                  deserves the reward.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="text-6xl font-black text-red-600/20 mb-4">03</div>
                <h3 className="text-3xl font-black tracking-tighter mb-4">
                  VERIFIED STUDIOS ONLY
                </h3>
                <p className="text-muted-foreground text-lg">
                  Every artist on our platform is linked to a verified studio. This ensures 
                  legitimacy, maintains quality standards, and builds trust with collectors.
                </p>
              </div>
              <div className="order-1 lg:order-2 aspect-video bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <span className="text-6xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
            JOIN THE REVOLUTION
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're an artist looking to share your work, a collector seeking unique pieces, 
            or a fulfillment partner ready to craft masterpieces—there's a place for you at STIGMATOR.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <Button className="bg-red-600 hover:bg-red-700 rounded-none font-black tracking-wider px-12 py-6 text-lg brutal-box">
                ACQUIRE THE MARK
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button 
                variant="outline"
                className="rounded-none font-black tracking-wider px-12 py-6 text-lg border-2 border-white/20 hover:bg-white/5"
              >
                GET STIGMATIZED
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
