"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, Copy, Users, DollarSign, TrendingUp, Lock, Unlock, 
  AlertCircle, ImageIcon, Loader2, X, CheckCircle, Trash2
} from "lucide-react"
import { useToast } from "@/components/toast/toast-context"
import { supabaseBrowser } from "@/lib/supabase/client"
import { getDesignsByArtist, type Design } from "@/lib/api/designs"
import { 
  createPartnershipCode, 
  getArtistPartnershipCodes,
  deletePartnershipCode,
  type PartnershipCode 
} from "@/lib/api/partnerships"
import { OptimizedImage } from "@/components/ui/optimized-image"

export default function ArtistPartnershipsPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  
  // Data states
  const [designs, setDesigns] = useState<Design[]>([])
  const [partnershipCodes, setPartnershipCodes] = useState<PartnershipCode[]>([])
  
  // Split configuration
  const [artistShare, setArtistShare] = useState(50)
  const [clientShare, setClientShare] = useState(30)
  const [studioShare, setStudioShare] = useState(20)
  
  // Client info
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [tattooLocation, setTattooLocation] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load designs
      const { data: { user } } = await supabaseBrowser().auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const designsData = await getDesignsByArtist(user.id)
      setDesigns(designsData)
      
      // Load partnership codes
      const codesData = await getArtistPartnershipCodes()
      setPartnershipCodes(codesData)
    } catch (err) {
      console.error("Error loading data:", err)
      showError("Failed to load data", "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const totalShares = artistShare + clientShare + studioShare
  const isValidSplit = totalShares === 100

  const handleGenerateCode = async () => {
    if (!selectedDesign || !isValidSplit || !clientName || !clientEmail) return
    
    setIsGenerating(true)
    try {
      const code = await createPartnershipCode({
        design_id: selectedDesign.id,
        artist_share: artistShare,
        client_share: clientShare,
        studio_share: studioShare,
        client_name: clientName,
        client_email: clientEmail,
        tattoo_location: tattooLocation,
        session_date: sessionDate,
      })
      
      setGeneratedCode(code.code)
      await loadData()
      success("Partnership code created!", "Share this code with your client.")
    } catch (err: any) {
      showError("Failed to create code", err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return
    
    try {
      await deletePartnershipCode(codeId)
      await loadData()
      success("Code deleted", "The partnership code has been removed.")
    } catch (err: any) {
      showError("Failed to delete", err.message)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    success("Copied!", "Code copied to clipboard")
  }

  const resetForm = () => {
    setShowCreateModal(false)
    setSelectedDesign(null)
    setArtistShare(50)
    setClientShare(30)
    setStudioShare(20)
    setClientName("")
    setClientEmail("")
    setTattooLocation("")
    setSessionDate("")
    setGeneratedCode(null)
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`

  // Calculate stats
  const stats = {
    activeCodes: partnershipCodes.filter(c => c.status === "active").length,
    redeemedCodes: partnershipCodes.filter(c => c.status === "redeemed").length,
    totalPartners: partnershipCodes.filter(c => c.status === "redeemed").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#050805] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#050805]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-[#e8f5e8]">
              PARTNERSHIP CODES
            </h1>
            <p className="text-[#6b8e6b] mt-1">
              Create revenue-sharing partnerships with your clients
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            CREATE CODE
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                ACTIVE CODES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-[#4ade80]">
                {stats.activeCodes}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                REDEEMED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-[#fbbf24]">
                {stats.redeemedCodes}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                TOTAL PARTNERS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-[#e8f5e8]">
                {stats.totalPartners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                YOUR DESIGNS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-[#e8f5e8]">
                {designs.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Codes Table */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
              PARTNERSHIP CODES
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partnershipCodes.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                <p className="text-[#6b8e6b] font-mono text-sm mb-2">NO PARTNERSHIP CODES YET</p>
                <p className="text-xs text-[#6b8e6b] mb-4">
                  Create codes to share revenue with your clients
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  className="border-[#1a2e1a] text-[#6b8e6b] rounded-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  CREATE FIRST CODE
                </Button>
              </div>
            ) : (
              <div className="border border-[#1a2e1a] overflow-x-auto">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#1a2e1a] bg-[#050805] font-mono text-xs tracking-wider text-[#6b8e6b] min-w-[800px]">
                  <div className="col-span-2">CODE</div>
                  <div className="col-span-2">DESIGN</div>
                  <div className="col-span-2">CLIENT</div>
                  <div className="col-span-1">SPLIT</div>
                  <div className="col-span-1">STATUS</div>
                  <div className="col-span-2">CREATED</div>
                  <div className="col-span-2 text-right">ACTIONS</div>
                </div>
                
                {partnershipCodes.map((code) => (
                  <div 
                    key={code.id} 
                    className="grid grid-cols-12 gap-4 p-4 border-b border-[#1a2e1a] hover:bg-[#050805] transition-colors items-center min-w-[800px]"
                  >
                    <div className="col-span-2 font-mono text-[#4ade80]">
                      {code.code}
                    </div>
                    <div className="col-span-2 text-sm text-[#e8f5e8]">
                      {code.design?.title || "Design"}
                    </div>
                    <div className="col-span-2 text-sm text-[#6b8e6b]">
                      {code.client_name}
                    </div>
                    <div className="col-span-1">
                      <span className="text-[#fbbf24] font-black">
                        {code.client_share}%
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-1 ${
                        code.status === "active" 
                          ? "bg-[#4ade80]/20 text-[#4ade80]"
                          : code.status === "redeemed"
                            ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                            : "bg-[#6b8e6b]/20 text-[#6b8e6b]"
                      }`}>
                        {code.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs text-[#6b8e6b]">
                      {new Date(code.created_at).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 text-right flex justify-end gap-2">
                      <button
                        onClick={() => copyCode(code.code)}
                        className="p-2 text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {code.status === "active" && (
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="p-2 text-[#6b8e6b] hover:text-[#dc2626] transition-colors"
                          title="Delete code"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a2e1a]">
              <div>
                <h2 className="text-xl font-black tracking-tighter text-[#e8f5e8]">
                  {generatedCode ? "CODE GENERATED" : "CREATE PARTNERSHIP CODE"}
                </h2>
                {!generatedCode && (
                  <p className="text-xs text-[#6b8e6b] mt-1">
                    Share revenue with your client
                  </p>
                )}
              </div>
              <button 
                onClick={resetForm}
                className="text-[#6b8e6b] hover:text-[#e8f5e8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {generatedCode ? (
                // Success State
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-[#4ade80] flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-black" />
                  </div>
                  
                  <div>
                    <p className="text-xs font-mono text-[#6b8e6b] mb-2">PARTNERSHIP CODE</p>
                    <div className="bg-[#050805] border-2 border-[#4ade80] p-6 inline-block">
                      <code className="text-2xl font-mono text-[#4ade80] tracking-wider">
                        {generatedCode}
                      </code>
                    </div>
                  </div>

                  <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 p-4 text-left">
                    <p className="text-sm text-[#fbbf24] font-bold mb-1">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      INSTRUCTIONS FOR YOUR CLIENT
                    </p>
                    <ol className="text-sm text-[#a3c9a3] space-y-1 ml-4">
                      <li>1. Go to stigmator.com/partner</li>
                      <li>2. Enter code: <strong className="text-[#fbbf24]">{generatedCode}</strong></li>
                      <li>3. Upload photo of their tattoo</li>
                      <li>4. Revenue sharing activates automatically</li>
                    </ol>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => copyCode(generatedCode)}
                      variant="outline"
                      className="rounded-none border-[#1a2e1a] text-[#6b8e6b]"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      COPY CODE
                    </Button>
                    <Button
                      onClick={resetForm}
                      className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
                    >
                      CREATE ANOTHER
                    </Button>
                  </div>
                </div>
              ) : (
                // Form State
                <>
                  {/* Design Selection */}
                  {!selectedDesign ? (
                    <div className="space-y-3">
                      <label className="text-xs font-mono text-[#6b8e6b]">SELECT DESIGN</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {designs.map((design) => (
                          <button
                            key={design.id}
                            onClick={() => setSelectedDesign(design)}
                            className="aspect-square bg-[#050805] border border-[#1a2e1a] hover:border-[#4ade80] transition-colors overflow-hidden relative"
                          >
                            {design.images?.[0] ? (
                              <OptimizedImage
                                src={design.images[0]}
                                alt={design.title}
                                fill
                                className="object-cover"
                                transform={{ width: 150, height: 150, resize: "cover" }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-[#1a2e1a]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-[#050805] border border-[#1a2e1a]">
                      <div className="w-12 h-12 bg-[#0a0f0a] overflow-hidden">
                        {selectedDesign.images?.[0] && (
                          <OptimizedImage
                            src={selectedDesign.images[0]}
                            alt={selectedDesign.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-[#e8f5e8]">{selectedDesign.title}</p>
                        <p className="text-xs text-[#6b8e6b]">Selected design</p>
                      </div>
                      <button 
                        onClick={() => setSelectedDesign(null)}
                        className="text-[#6b8e6b] hover:text-[#dc2626]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Revenue Split */}
                  <div className="space-y-4">
                    <label className="text-xs font-mono text-[#6b8e6b]">REVENUE SPLIT</label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="w-20 text-sm text-[#e8f5e8]">You</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={artistShare}
                          onChange={(e) => setArtistShare(Number(e.target.value))}
                          className="flex-1 accent-[#4ade80]"
                        />
                        <span className="w-12 text-right font-black text-[#4ade80]">{artistShare}%</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="w-20 text-sm text-[#e8f5e8]">Client</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={clientShare}
                          onChange={(e) => setClientShare(Number(e.target.value))}
                          className="flex-1 accent-[#fbbf24]"
                        />
                        <span className="w-12 text-right font-black text-[#fbbf24]">{clientShare}%</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="w-20 text-sm text-[#e8f5e8]">Studio</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={studioShare}
                          onChange={(e) => setStudioShare(Number(e.target.value))}
                          className="flex-1 accent-[#dc2626]"
                        />
                        <span className="w-12 text-right font-black text-[#dc2626]">{studioShare}%</span>
                      </div>
                    </div>

                    {!isValidSplit && (
                      <p className="text-[#dc2626] text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Total must equal 100% (currently {totalShares}%)
                      </p>
                    )}

                    <div className="bg-[#050805] border border-[#1a2e1a] p-3">
                      <p className="text-xs text-[#6b8e6b]">
                        Example: On a $100 sale, after platform fee ($15), 
                        your client earns {formatCurrency(Math.round(8500 * clientShare / 100))}
                      </p>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="space-y-3">
                    <label className="text-xs font-mono text-[#6b8e6b]">CLIENT INFORMATION</label>
                    <Input
                      placeholder="Client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                    />
                    <Input
                      type="email"
                      placeholder="Client email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                    />
                    <Input
                      placeholder="Tattoo location (optional)"
                      value={tattooLocation}
                      onChange={(e) => setTattooLocation(e.target.value)}
                      className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                    />
                    <Input
                      type="date"
                      placeholder="Session date (optional)"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateCode}
                    disabled={!selectedDesign || !isValidSplit || !clientName || !clientEmail || isGenerating}
                    className="w-full h-12 bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" />GENERATING...</>
                    ) : (
                      "GENERATE PARTNERSHIP CODE"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
