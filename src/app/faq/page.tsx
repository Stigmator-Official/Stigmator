"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, HelpCircle, MessageCircle, Users, Package, DollarSign, Droplets } from "lucide-react"

const faqs = [
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "What is STIGMATOR?",
        a: "STIGMATOR is a platform that connects tattoo artists with fashion, allowing artists to monetize their designs on apparel. We bridge the gap between tattoo culture and fashion, creating wearable masterpieces.",
      },
      {
        q: "How does it work?",
        a: "Artists upload their designs, create garment mockups, and set their prices. When customers purchase, garments are made-to-order and artists earn 70% of profits. We handle production, fulfillment, and customer service.",
      },
      {
        q: "Is STIGMATOR available worldwide?",
        a: "We currently ship to most countries worldwide. Artists can join from anywhere, though we're actively expanding our manufacturing partner network for better local fulfillment.",
      },
    ],
  },
  {
    category: "For Artists",
    icon: Droplets,
    questions: [
      {
        q: "How do I become a verified artist?",
        a: "Apply through our artist application page. We verify that you're a legitimate tattoo artist working at a licensed studio. The process typically takes 3-5 business days.",
      },
      {
        q: "How much can I earn?",
        a: "Artists keep 70% of profits from each sale. You set your own retail prices above our base costs, so your earnings depend on your pricing strategy and sales volume.",
      },
      {
        q: "Do I keep the rights to my designs?",
        a: "Yes! You retain full ownership of your designs. You grant us a license only to produce garments featuring your art. You can remove designs from the platform at any time.",
      },
      {
        q: "What's the deposit system?",
        a: "A small deposit reserves manufacturing capacity for your design. This deposit is recouped from your first sales - once you've sold enough units, the deposit is returned and you earn full profit.",
      },
    ],
  },
  {
    category: "For Customers",
    icon: Users,
    questions: [
      {
        q: "How long does shipping take?",
        a: "Since all garments are made-to-order, production takes 3-5 business days. Shipping typically adds 5-10 business days depending on your location and chosen shipping method.",
      },
      {
        q: "What if my garment doesn't fit?",
        a: "We offer hassle-free exchanges within 30 days. Contact our support team and we'll help you get the right size. Each garment page includes a detailed size guide.",
      },
      {
        q: "How do I know the artist is legitimate?",
        a: "Every artist on our platform is verified. Check their profile for the verification badge, studio information, and links to their social media and portfolio.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    icon: Package,
    questions: [
      {
        q: "Can I track my order?",
        a: "Yes! Once your order ships, you'll receive a tracking number via email. You can also track orders from your account dashboard.",
      },
      {
        q: "What if my order arrives damaged?",
        a: "Contact us immediately with photos of the damage. We'll send a replacement at no cost and handle any claims with our shipping partners.",
      },
      {
        q: "Do you offer wholesale or bulk orders?",
        a: "Artists can purchase their own designs in bulk at manufacturing cost. For other wholesale inquiries, please contact us directly.",
      },
    ],
  },
  {
    category: "Earnings & Payments",
    icon: DollarSign,
    questions: [
      {
        q: "How do attribution codes work?",
        a: "When you get tattooed by a STIGMATOR artist, they can give you an attribution code. Enter this code to link the design to your account and earn royalties from merchandise sales.",
      },
      {
        q: "When do artists get paid?",
        a: "Artist earnings are accumulated in your account. You can request a payout at any time once you reach the $50 minimum. Payouts are processed within 5 business days.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit cards, PayPal, and Apple Pay. For artist payouts, we support bank transfer, PayPal, and other methods depending on your region.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredFaqs = activeCategory
    ? faqs.filter((cat) => cat.category === activeCategory)
    : faqs

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1200px] mx-auto">
          <span className="font-mono text-xs tracking-widest text-[#dc2626] mb-4 block">
            [SUPPORT CENTER]
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 text-[#e8f5e8]">
            FREQUENTLY ASKED
            <br />
            <span className="text-[#4ade80]">QUESTIONS</span>
          </h1>
          <p className="text-xl text-[#6b8e6b] max-w-2xl">
            Everything you need to know about STIGMATOR. Can&apos;t find what you&apos;re looking for? 
            Contact our support team.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 sm:px-8 lg:px-16 py-8 border-b border-[#1a2e1a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 font-mono text-sm tracking-wider transition-colors ${
                activeCategory === null
                  ? "bg-[#4ade80] text-black"
                  : "bg-[#0a0f0a] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
              }`}
            >
              ALL
            </button>
            {faqs.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-4 py-2 font-mono text-sm tracking-wider transition-colors flex items-center gap-2 ${
                  activeCategory === cat.category
                    ? "bg-[#4ade80] text-black"
                    : "bg-[#0a0f0a] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="space-y-12">
            {filteredFaqs.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-[#4ade80]" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
                    {category.category}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, idx) => {
                    const itemId = `${category.category}-${idx}`
                    const isOpen = openItems[itemId]

                    return (
                      <div
                        key={itemId}
                        className="border border-[#1a2e1a] bg-[#0a0f0a] overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-[#050805] transition-colors"
                        >
                          <span className="font-black tracking-tighter text-[#e8f5e8] pr-4">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-[#4ade80] flex-shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="text-[#6b8e6b] leading-relaxed border-t border-[#1a2e1a] pt-4">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-t border-[#1a2e1a]">
        <div className="max-w-[1200px] mx-auto text-center">
          <MessageCircle className="h-12 w-12 text-[#4ade80] mx-auto mb-4" />
          <h2 className="text-2xl font-black tracking-tighter mb-4 text-[#e8f5e8]">
            STILL HAVE QUESTIONS?
          </h2>
          <p className="text-[#6b8e6b] mb-6 max-w-md mx-auto">
            Our support team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <Link href="/contact">
            <button className="px-8 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black tracking-wider">
              CONTACT SUPPORT
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
