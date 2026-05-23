"use client"

import { Shield, Eye, Database, Share2, Lock } from "lucide-react"

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: `
We collect information you provide directly to us, including:

• Account information (name, email, password)
• Profile information (bio, location, portfolio links)
• Payment information (processed securely through our payment providers)
• Design uploads and associated metadata
• Communication records with our support team

We also automatically collect certain information about your device and usage of the platform.
    `,
  },
  {
    icon: Database,
    title: "How We Use Your Information",
    content: `
STIGMATOR uses your information to:

• Provide and maintain our services
• Process transactions and send related information
• Send technical notices, updates, and support messages
• Respond to your comments and questions
• Improve our platform and develop new features
• Monitor usage patterns and analyze trends
• Detect, prevent, and address fraud and security issues

We will never sell your personal information to third parties.
    `,
  },
  {
    icon: Share2,
    title: "Information Sharing",
    content: `
We may share your information with:

• Service providers who perform services on our behalf
• Payment processors to handle transactions
• Shipping partners to fulfill orders
• Legal authorities when required by law
• Other parties with your consent

When you make a purchase, certain information (such as your general location) is shared with the artist to fulfill the order.
    `,
  },
  {
    icon: Lock,
    title: "Data Security",
    content: `
We implement appropriate technical and organizational measures to protect your personal information:

• Encryption of sensitive data in transit and at rest
• Regular security audits and penetration testing
• Access controls and authentication requirements
• Secure data centers with industry-standard protections

However, no method of transmission over the Internet is 100% secure. We strive to protect your data but cannot guarantee absolute security.
    `,
  },
  {
    icon: Shield,
    title: "Your Rights",
    content: `
You have the right to:

• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your personal information
• Object to processing of your information
• Export your data in a portable format

To exercise these rights, please contact us at privacy@stigmator.com.
    `,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1200px] mx-auto">
          <span className="font-mono text-xs tracking-widest text-[#dc2626] mb-4 block">
            [LEGAL]
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 text-[#e8f5e8]">
            PRIVACY
            <br />
            <span className="text-[#4ade80]">POLICY</span>
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
                  STIGMATOR, Inc. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed 
                  to protecting your personal information. This Privacy Policy explains how we collect, 
                  use, and share information about you when you use our platform.
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

              <section id="cookies" className="scroll-mt-24 pt-8 border-t border-[#1a2e1a]">
                <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-4">
                  Cookies & Tracking
                </h2>
                <p className="text-[#6b8e6b] leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our platform 
                  and hold certain information. You can instruct your browser to refuse all cookies 
                  or to indicate when a cookie is being sent. However, some features may not function 
                  properly without cookies.
                </p>
              </section>

              <section id="contact" className="scroll-mt-24 pt-8 border-t border-[#1a2e1a]">
                <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-4">
                  Contact Us
                </h2>
                <p className="text-[#6b8e6b] leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-[#0a0f0a] border border-[#1a2e1a]">
                  <p className="text-[#e8f5e8]">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:privacy@stigmator.com" className="text-[#4ade80] hover:underline">
                      privacy@stigmator.com
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
