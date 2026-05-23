"use client"

import { useState } from "react"
import { Mail, MapPin, Instagram, Twitter, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/toast/toast-context"

const contactReasons = [
  { id: "general", label: "General Inquiry" },
  { id: "artist", label: "Artist Application" },
  { id: "order", label: "Order Support" },
  { id: "partnership", label: "Partnership" },
  { id: "bug", label: "Report a Bug" },
  { id: "press", label: "Press & Media" },
]

export default function ContactPage() {
  const { success, error: showError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "general",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.length < 20) {
      newErrors.message = "Message must be at least 20 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showError("Please fix the errors", "Some fields need your attention")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    success("Message sent!", "We'll get back to you within 24 hours")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 texture-grain">
        <div className="max-w-[600px] mx-auto px-4 sm:px-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#4ade80] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-black" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-4">
              MESSAGE SENT
            </h1>
            <p className="text-[#6b8e6b] font-mono mb-8">
              Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  name: "",
                  email: "",
                  reason: "general",
                  subject: "",
                  message: "",
                })
              }}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider"
            >
              SEND ANOTHER MESSAGE
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      {/* Header */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1200px] mx-auto">
          <span className="font-mono text-xs tracking-widest text-[#dc2626] mb-4 block">
            [GET IN TOUCH]
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 text-[#e8f5e8]">
            CONTACT
            <br />
            <span className="text-[#4ade80]">STIGMATOR</span>
          </h1>
          <p className="text-xl text-[#6b8e6b] max-w-2xl">
            Have a question? We&apos;re here to help. Reach out and our team will get back to you within 24 hours.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black tracking-tighter mb-6 text-[#e8f5e8]">
                  CONTACT INFO
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-[#4ade80]" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#6b8e6b] mb-1">EMAIL</p>
                      <a href="mailto:support@stigmator.com" className="text-[#e8f5e8] hover:text-[#4ade80] transition-colors">
                        support@stigmator.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[#4ade80]" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#6b8e6b] mb-1">LOCATION</p>
                      <p className="text-[#e8f5e8]">
                        Los Angeles, CA
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tighter mb-6 text-[#e8f5e8]">
                  FOLLOW US
                </h2>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com/stigmator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#1a2e1a] flex items-center justify-center hover:bg-[#4ade80] hover:text-black transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com/stigmator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#1a2e1a] flex items-center justify-center hover:bg-[#4ade80] hover:text-black transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
                <h3 className="font-black tracking-tighter text-[#e8f5e8] mb-2">
                  RESPONSE TIME
                </h3>
                <p className="text-sm text-[#6b8e6b]">
                  We aim to respond to all inquiries within 24 hours during business days.
                  For urgent matters, please include &quot;URGENT&quot; in your subject line.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-[#6b8e6b] mb-2">
                      NAME *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your name"
                      className={`bg-[#050805] border rounded-none h-12 text-[#e8f5e8] ${
                        errors.name ? "border-[#dc2626]" : "border-[#1a2e1a]"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[#dc2626] text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[#6b8e6b] mb-2">
                      EMAIL *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className={`bg-[#050805] border rounded-none h-12 text-[#e8f5e8] ${
                        errors.email ? "border-[#dc2626]" : "border-[#1a2e1a]"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[#dc2626] text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#6b8e6b] mb-2">
                    REASON FOR CONTACT *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {contactReasons.map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => handleChange("reason", reason.id)}
                        className={`px-4 py-2 text-sm font-mono transition-colors ${
                          formData.reason === reason.id
                            ? "bg-[#4ade80] text-black"
                            : "bg-[#0a0f0a] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
                        }`}
                      >
                        {reason.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#6b8e6b] mb-2">
                    SUBJECT *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="What is this about?"
                    className={`bg-[#050805] border rounded-none h-12 text-[#e8f5e8] ${
                      errors.subject ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-[#dc2626] text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#6b8e6b] mb-2">
                    MESSAGE *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className={`w-full bg-[#050805] border rounded-none p-4 text-[#e8f5e8] resize-none focus:outline-none ${
                      errors.message ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[#dc2626] text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      SEND MESSAGE
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
