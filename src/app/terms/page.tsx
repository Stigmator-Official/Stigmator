"use client"

import { FileText, Scale, AlertTriangle, CheckCircle } from "lucide-react"

const sections = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    content: `
By accessing or using STIGMATOR, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.

STIGMATOR reserves the right to modify these terms at any time. We will notify users of significant changes via email or through the platform.
    `,
  },
  {
    icon: Scale,
    title: "Artist Agreement",
    content: `
As an artist on STIGMATOR, you:

• Retain full ownership and copyright of your designs
• Grant STIGMATOR a license to produce and sell merchandise featuring your art
• Confirm you have the right to use and license the designs you upload
• Will not upload content that infringes on third-party rights
• Agree to our revenue sharing model (70% artist / 30% platform)

STIGMATOR reserves the right to remove designs that violate our content guidelines or terms of service.
    `,
  },
  {
    icon: CheckCircle,
    title: "Purchases & Refunds",
    content: `
All purchases made through STIGMATOR are subject to the following:

• All garments are made-to-order and production begins after payment
• Prices are as displayed and may be subject to applicable taxes
• Shipping times are estimates and may vary based on location
• We accept returns within 30 days for defective or incorrect items
• Custom or limited edition items may not be eligible for return

Refunds will be processed to the original payment method within 5-10 business days.
    `,
  },
  {
    icon: AlertTriangle,
    title: "Prohibited Conduct",
    content: `
Users may not:

• Upload designs that contain hate speech, explicit content, or illegal material
• Impersonate other artists or individuals
• Attempt to circumvent platform fees or payment systems
• Use automated systems to scrape or manipulate the platform
• Harass, abuse, or threaten other users
• Violate any applicable laws or regulations

Violation of these rules may result in account suspension or termination.
    `,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1200px] mx-auto">
          <span className="font-mono text-xs tracking-widest text-[#dc2626] mb-4 block">
            [LEGAL]
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 text-[#e8f5e8]">
            TERMS OF
            <br />
            <span className="text-[#4ade80]">SERVICE</span>
          </h1>
          <p className="text-xl text-[#6b8e6b] max-w-2xl">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="font-mono text-xs text-[#6b8e6b] mb-4">CONTENTS</h2>
                <nav className="space-y-2">
                  {sections.map((section, idx) => (
                    <a
                      key={section.title}
                      href={`#section-${idx}`}
                      className="block text-sm text-[#6b8e6b] hover:text-[#4ade80] transition-colors py-1"
                    >
                      {section.title}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    className="block text-sm text-[#6b8e6b] hover:text-[#4ade80] transition-colors py-1"
                  >
                    Contact Us
                  </a>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
                <p className="text-[#6b8e6b] leading-relaxed">
                  Welcome to STIGMATOR. These Terms of Service govern your use of our platform 
                  and constitute a legally binding agreement between you and STIGMATOR, Inc. 
                  Please read these terms carefully before using our services.
                </p>
              </div>

              {sections.map((section, idx) => (
                <section key={section.title} id={`section-${idx}`} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-[#4ade80]" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
                      {section.title}
                    </h2>
                  </div>
                  <div className="pl-[52px]">
                    <div className="text-[#6b8e6b] leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </section>
              ))}

              <section id="contact" className="scroll-mt-24 pt-8 border-t border-[#1a2e1a]">
                <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-4">
                  Contact Us
                </h2>
                <p className="text-[#6b8e6b] leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-[#0a0f0a] border border-[#1a2e1a]">
                  <p className="text-[#e8f5e8]">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:legal@stigmator.com" className="text-[#4ade80] hover:underline">
                      legal@stigmator.com
                    </a>
                  </p>
                  <p className="text-[#e8f5e8] mt-2">
                    <strong>Address:</strong> STIGMATOR, Inc., Los Angeles, CA
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
