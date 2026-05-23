"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Upload,
  ImageIcon,
  User,
  Percent,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Hash,
} from "lucide-react"
import Image from "next/image"

interface UploadTabProps {
  onUpload: (data: {
    title: string
    image: string
    partnerId?: string
    partnerName?: string
    royaltyPercentage: number
    activationCode: string
  }) => void
}

export function UploadTab({ onUpload }: UploadTabProps) {
  const [title, setTitle] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [partnerSearch, setPartnerSearch] = useState("")
  const [partnerName, setPartnerName] = useState("")
  const [partnerId, setPartnerId] = useState("")
  const [royaltyPercentage, setRoyaltyPercentage] = useState(20)
  const [generatedCode, setGeneratedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = "INK-"
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    code += "-"
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedCode(code)
    return code
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = () => {
    if (!title || !image) return
    
    let code = generatedCode
    if (!code) {
      code = generateCode()
    }
    
    onUpload({
      title,
      image,
      partnerId: partnerId || undefined,
      partnerName: partnerName || undefined,
      royaltyPercentage,
      activationCode: code,
    })

    // Reset form
    setTitle("")
    setImage(null)
    setPartnerName("")
    setPartnerId("")
    setPartnerSearch("")
    setRoyaltyPercentage(20)
    setGeneratedCode("")
  }

  const isValid = title && image

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Design Upload */}
      <div className="space-y-6">
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <Upload className="h-5 w-5 text-[#4ade80]" />
              DESIGN DETAILS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#6b8e6b]">DESIGN TITLE</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter design name"
                className="bg-[#050805] border-[#1a2e1a] rounded-none font-black"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#6b8e6b]">DESIGN IMAGE</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-none cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#4ade80] bg-[#4ade80]/5"
                    : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                } ${image ? "h-64" : "h-48"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImage(null)
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6b8e6b]">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm font-mono">DROP IMAGE OR CLICK TO UPLOAD</p>
                    <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Partner Attribution */}
      <div className="space-y-6">
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <User className="h-5 w-5 text-[#fbbf24]" />
              PARTNER ATTRIBUTION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-[#6b8e6b]">
              Attribute this design to the person who has this tattoo on their body. 
              They&apos;ll earn royalties when products featuring this design sell.
            </p>

            {/* Partner Search */}
            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#6b8e6b]">PARTNER NAME OR EMAIL</Label>
              <Input
                value={partnerSearch}
                onChange={(e) => {
                  setPartnerSearch(e.target.value)
                  // Simulated search - in real app would search users
                  if (e.target.value.length > 3) {
                    setPartnerName(e.target.value)
                    setPartnerId(`user_${Date.now()}`)
                  }
                }}
                placeholder="Search by name or email"
                className="bg-[#050805] border-[#1a2e1a] rounded-none"
              />
              {partnerName && (
                <div className="p-3 bg-[#4ade80]/5 border border-[#4ade80]/30 flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4ade80]" />
                  <span className="text-sm text-[#e8f5e8]">
                    Partner: <span className="font-black">{partnerName}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Royalty Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono text-[#6b8e6b] flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  PARTNER ROYALTY PERCENTAGE
                </Label>
                <Badge className="bg-[#fbbf24] text-black rounded-none font-black">
                  {royaltyPercentage}%
                </Badge>
              </div>
              <Slider
                value={[royaltyPercentage]}
                onValueChange={(v) => setRoyaltyPercentage(v[0])}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#6b8e6b]">
                <span>5% (low)</span>
                <span>50% (high)</span>
              </div>
              <p className="text-xs text-[#6b8e6b]">
                Partner earns {royaltyPercentage}% of each sale. You keep the rest.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activation Code Generation */}
        <Card className="bg-[#0a0f0a] border-[#4ade80]/30 rounded-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/10 rounded-full blur-2xl" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <Hash className="h-5 w-5 text-[#4ade80]" />
              ACTIVATION CODE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <p className="text-xs text-[#6b8e6b]">
              Generate a code for your partner to activate this tattoo in their Ink Portfolio.
            </p>

            {!generatedCode ? (
              <Button
                onClick={generateCode}
                className="w-full bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                GENERATE CODE
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-4 bg-[#050805] border border-[#4ade80]/30 text-center">
                    <div className="text-xs text-[#6b8e6b] mb-1">ACTIVATION CODE</div>
                    <div className="text-2xl font-black text-[#4ade80] tracking-wider font-mono">
                      {generatedCode}
                    </div>
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="h-full px-4 rounded-none border-[#1a2e1a] text-[#6b8e6b]"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-[#4ade80]" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-[#6b8e6b]">
                  Share this code with {partnerName || "your partner"}. They&apos;ll enter it in their Ink Portfolio to claim royalties.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-14 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-[#1a2e1a] disabled:text-[#6b8e6b] text-white rounded-none font-black text-lg"
        >
          UPLOAD DESIGN & ATTRIBUTE
        </Button>

        {!isValid && (
          <div className="flex items-center gap-2 text-xs text-[#6b8e6b] justify-center">
            <AlertCircle className="h-4 w-4" />
            Add title and image to continue
          </div>
        )}
      </div>
    </div>
  )
}
