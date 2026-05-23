"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Palette, 
  ShoppingBag, 
  Factory, 
  ArrowRight, 
  Check, 
  Sparkles,
  Zap,
  Target,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Brush,
  Crown,
  Wrench,
  Star,
  TrendingUp,
  Heart,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientBrowser } from "@/lib/supabase/client"

interface Role {
  id: "artist" | "customer" | "fulfillment"
  label: string
  tagline: string
  description: string
  icon: React.ElementType
  features: { icon: React.ElementType; text: string }[]
  color: string
  bgGradient: string
  loadingMessage: string
  summary: string
}

const ROLES: Role[] = [
  {
    id: "artist",
    label: "ARTIST",
    tagline: "MARK THE WORLD",
    description: "Upload your designs, create garments, and build your empire. Every piece sold carries your signature.",
    icon: Palette,
    features: [
      { icon: Brush, text: "Upload unlimited designs" },
      { icon: TrendingUp, text: "Set your own royalties" },
      { icon: Crown, text: "Create partnership codes" },
      { icon: Star, text: "Track sales & earnings" },
      { icon: Heart, text: "Build your collector base" }
    ],
    color: "#4ade80",
    bgGradient: "from-[#4ade80]/20 via-transparent to-transparent",
    loadingMessage: "Setting up your studio...",
    summary: "You'll be able to upload designs, set prices, and earn from every sale. Build your brand and connect with collectors worldwide."
  },
  {
    id: "customer",
    label: "COLLECTOR",
    tagline: "ACQUIRE THE RARE",
    description: "Discover unique pieces from tattoo artists worldwide. Wear art that tells your story.",
    icon: ShoppingBag,
    features: [
      { icon: Star, text: "Exclusive artist merchandise" },
      { icon: Zap, text: "Limited edition drops" },
      { icon: Crown, text: "Reward points program" },
      { icon: Heart, text: "Save favorites & wishlists" },
      { icon: Target, text: "Early access to releases" }
    ],
    color: "#60a5fa",
    bgGradient: "from-[#60a5fa]/20 via-transparent to-transparent",
    loadingMessage: "Curating your collection...",
    summary: "You'll get access to exclusive artist merchandise, limited drops, and a personalized shopping experience."
  },
  {
    id: "fulfillment",
    label: "MAKER",
    tagline: "CRAFT THE VISION",
    description: "Partner with artists to manufacture their designs. Quality craftsmanship meets bold art.",
    icon: Factory,
    features: [
      { icon: Target, text: "Review artist submissions" },
      { icon: Package, text: "Manage production queue" },
      { icon: TrendingUp, text: "Set your manufacturing rates" },
      { icon: Users, text: "Build artist relationships" },
      { icon: Star, text: "Track performance metrics" }
    ],
    color: "#fbbf24",
    bgGradient: "from-[#fbbf24]/20 via-transparent to-transparent",
    loadingMessage: "Preparing your workshop...",
    summary: "You'll review artist submissions, manage production, and build lasting partnerships with creators."
  }
]

type Step = "selection" | "confirmation" | "loading" | "success"

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role["id"] | null>(null)
  const [hoveredRole, setHoveredRole] = useState<Role["id"] | null>(null)
  const [step, setStep] = useState<Step>("selection")
  const [focusedRoleIndex, setFocusedRoleIndex] = useState<number>(-1)

  const selectedRoleData = ROLES.find(r => r.id === selectedRole)

  const handleRoleSelect = useCallback((roleId: Role["id"]) => {
    setSelectedRole(roleId)
  }, [])

  const handleRoleKeyDown = useCallback((e: React.KeyboardEvent, roleId: Role["id"], index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setSelectedRole(roleId)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      const nextIndex = (index + 1) % ROLES.length
      setFocusedRoleIndex(nextIndex)
      document.getElementById(`role-card-${ROLES[nextIndex].id}`)?.focus()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      const prevIndex = index === 0 ? ROLES.length - 1 : index - 1
      setFocusedRoleIndex(prevIndex)
      document.getElementById(`role-card-${ROLES[prevIndex].id}`)?.focus()
    }
  }, [])

  const handleContinue = () => {
    if (!selectedRole) return
    setStep("confirmation")
  }

  const handleConfirm = async () => {
    if (!selectedRole) return
    
    setStep("loading")
    
    try {
      const supabase = createClientBrowser()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from("profiles")
          .update({ role: selectedRole })
          .eq("id", user.id)
      }
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setStep("success")
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to set role:", error)
      setStep("confirmation")
    }
  }

  const handleBack = () => {
    if (step === "confirmation") {
      setStep("selection")
    } else if (step === "selection") {
      router.push("/auth/login")
    }
  }

  const isSelectionStep = step === "selection"
  const isConfirmationStep = step === "confirmation"
  const isLoadingStep = step === "loading"
  const isSuccessStep = step === "success"

  return (
    <div className="min-h-screen bg-[#050805] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />
        
        {/* Gradient orbs */}
        {selectedRole && (
          <motion.div 
            layoutId="bg-glow"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ backgroundColor: selectedRoleData?.color, opacity: 0.15 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-4 sm:pt-8 pb-4 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="flex items-center gap-2 text-[#6b8e6b] hover:text-white transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050805] rounded-none px-2 py-1"
              aria-label={isSelectionStep ? "Back to login" : "Go back to role selection"}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-mono text-xs tracking-wider hidden sm:inline">
                {isSelectionStep ? "BACK TO LOGIN" : "CHANGE SELECTION"}
              </span>
              <span className="font-mono text-xs tracking-wider sm:hidden">
                BACK
              </span>
            </motion.button>

            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-[#4ade80]" />
              <span className="font-black tracking-tighter text-white text-sm sm:text-base">STIGMATOR</span>
            </motion.div>

            {/* Step indicator */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[#6b8e6b] font-mono text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              <span className="hidden sm:inline">STEP {isConfirmationStep ? "3" : "2"} OF 3</span>
              <span className="sm:hidden">{isConfirmationStep ? "3/3" : "2/3"}</span>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-12">
          <div className="max-w-6xl w-full mx-auto">
            
            {/* Title Section */}
            <AnimatePresence mode="wait">
              {isSelectionStep && (
                <motion.div
                  key="selection-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center mb-8 sm:mb-12"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
                  >
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#4ade80]" />
                    <span className="font-mono text-xs tracking-[0.2em] sm:tracking-[0.3em] text-[#4ade80]">
                      CHOOSE YOUR PATH
                    </span>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#4ade80]" />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-4"
                  >
                    WHAT BRINGS YOU
                    <span className="block text-[#4ade80]">TO THE INK?</span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#6b8e6b] font-mono text-xs sm:text-sm max-w-xl mx-auto px-4"
                  >
                    Select the path that resonates. This defines your experience, 
                    but you&apos;re never locked in—artists can collect, collectors can create.
                  </motion.p>
                </motion.div>
              )}

              {isConfirmationStep && selectedRoleData && (
                <motion.div
                  key="confirmation-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center mb-8 sm:mb-12"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
                  >
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: selectedRoleData.color }} />
                    <span className="font-mono text-xs tracking-[0.2em] sm:tracking-[0.3em]" style={{ color: selectedRoleData.color }}>
                      CONFIRM YOUR PATH
                    </span>
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: selectedRoleData.color }} />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white mb-4"
                  >
                    READY TO BECOME A
                    <span className="block" style={{ color: selectedRoleData.color }}>{selectedRoleData.label}?</span>
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role Cards Grid */}
            <AnimatePresence mode="wait">
              {isSelectionStep && (
                <motion.div
                  key="role-cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
                  role="radiogroup"
                  aria-label="Select your role"
                >
                  {ROLES.map((role, index) => {
                    const Icon = role.icon
                    const isSelected = selectedRole === role.id
                    const isHovered = hoveredRole === role.id
                    
                    return (
                      <motion.button
                        key={role.id}
                        id={`role-card-${role.id}`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${role.label} - ${role.tagline}. ${role.description}`}
                        tabIndex={focusedRoleIndex === index ? 0 : -1}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={() => handleRoleSelect(role.id)}
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                        onKeyDown={(e) => handleRoleKeyDown(e, role.id, index)}
                        onFocus={() => setFocusedRoleIndex(index)}
                        className={`relative group text-left p-4 sm:p-6 border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050805] touch-manipulation ${
                          isSelected 
                            ? "border-[#4ade80] bg-[#4ade80]/10" 
                            : "border-[#1a2e1a] bg-[#0a0f0a] hover:border-[#4ade80]/50"
                        }`}
                        style={{
                          boxShadow: isSelected ? `0 0 30px ${role.color}40, inset 0 0 30px ${role.color}10` : undefined,
                          borderColor: isSelected ? role.color : undefined
                        }}
                      >
                        {/* Selection glow effect */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                boxShadow: `inset 0 0 60px ${role.color}20, 0 0 40px ${role.color}30`
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Background gradient on hover/select */}
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} transition-opacity duration-500 ${
                            isSelected || isHovered ? "opacity-100" : "opacity-0"
                          }`} 
                        />
                        
                        {/* Content */}
                        <div className="relative z-10">
                          {/* Icon & Selection Indicator */}
                          <div className="flex items-start justify-between mb-4">
                            <motion.div 
                              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border-2 transition-colors duration-300"
                              style={{ 
                                borderColor: isSelected ? role.color : "#1a2e1a",
                                backgroundColor: isSelected ? `${role.color}20` : "transparent"
                              }}
                              animate={isSelected ? {
                                boxShadow: [`0 0 0px ${role.color}00`, `0 0 20px ${role.color}50`, `0 0 0px ${role.color}00`]
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Icon 
                                className="h-6 w-6 sm:h-7 sm:w-7 transition-colors duration-300" 
                                style={{ color: isSelected ? role.color : "#6b8e6b" }}
                              />
                            </motion.div>
                            
                            {/* Animated Selection indicator */}
                            <div 
                              className={`w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 ${
                                isSelected 
                                  ? "border-transparent" 
                                  : "border-[#1a2e1a] group-hover:border-[#4ade80]/50"
                              }`}
                              style={{ backgroundColor: isSelected ? role.color : "transparent" }}
                            >
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  >
                                    <Check className="h-4 w-4 text-black" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          
                          {/* Title Section */}
                          <div className="mb-3">
                            <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-white mb-1">
                              {role.label}
                            </h3>
                            <p 
                              className="text-xs sm:text-sm font-black tracking-wider"
                              style={{ color: role.color }}
                            >
                              {role.tagline}
                            </p>
                          </div>
                          
                          {/* Description */}
                          <p className="text-xs sm:text-sm text-[#6b8e6b] leading-relaxed mb-4">
                            {role.description}
                          </p>
                          
                          {/* Features List */}
                          <AnimatePresence>
                            {(isSelected || isHovered) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t border-[#1a2e1a]">
                                  <ul className="space-y-2">
                                    {role.features.slice(0, 3).map((feature, i) => {
                                      const FeatureIcon = feature.icon
                                      return (
                                        <motion.li 
                                          key={i}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.05 }}
                                          className="flex items-center gap-2 text-xs text-[#6b8e6b] font-mono"
                                        >
                                          <FeatureIcon className="h-3 w-3 flex-shrink-0" style={{ color: role.color }} />
                                          <span>{feature.text}</span>
                                        </motion.li>
                                      )
                                    })}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirmation Step */}
            <AnimatePresence mode="wait">
              {isConfirmationStep && selectedRoleData && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  {/* Summary Box */}
                  <div 
                    className="p-6 sm:p-8 border-2 mb-6 relative overflow-hidden"
                    style={{ borderColor: selectedRoleData.color }}
                  >
                    {/* Background glow */}
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{ backgroundColor: selectedRoleData.color }}
                    />
                    
                    {/* Animated border glow */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        boxShadow: [`inset 0 0 20px ${selectedRoleData.color}20`, `inset 0 0 40px ${selectedRoleData.color}40`, `inset 0 0 20px ${selectedRoleData.color}20`]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <div className="relative z-10">
                      {/* Icon and Title */}
                      <div className="flex items-center gap-4 mb-6">
                        <div 
                          className="w-16 h-16 flex items-center justify-center border-2"
                          style={{ borderColor: selectedRoleData.color, backgroundColor: `${selectedRoleData.color}20` }}
                        >
                          <selectedRoleData.icon 
                            className="h-8 w-8"
                            style={{ color: selectedRoleData.color }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-mono text-[#6b8e6b] mb-1">YOU SELECTED</p>
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                            {selectedRoleData.label}
                          </h2>
                          <p className="text-sm font-black tracking-wider" style={{ color: selectedRoleData.color }}>
                            {selectedRoleData.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Summary Text */}
                      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4 mb-6">
                        <p className="text-sm text-[#6b8e6b] leading-relaxed">
                          {selectedRoleData.summary}
                        </p>
                      </div>

                      {/* Features Preview */}
                      <div>
                        <p className="text-xs font-mono text-[#6b8e6b] mb-3">WHAT YOU&apos;LL GET</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedRoleData.features.map((feature, i) => {
                            const FeatureIcon = feature.icon
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3"
                              >
                                <div 
                                  className="w-8 h-8 flex items-center justify-center border"
                                  style={{ borderColor: `${selectedRoleData.color}40` }}
                                >
                                  <FeatureIcon className="h-4 w-4" style={{ color: selectedRoleData.color }} />
                                </div>
                                <span className="text-xs sm:text-sm text-[#6b8e6b]">{feature.text}</span>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-14 text-base font-black tracking-wider rounded-none border-2 border-[#1a2e1a] bg-transparent text-[#6b8e6b] hover:bg-[#1a2e1a] hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050805]"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      GO BACK
                    </Button>
                    
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 h-14 text-base font-black tracking-wider rounded-none relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050805]"
                      style={{ 
                        backgroundColor: selectedRoleData.color,
                        color: "#000",
                        boxShadow: `0 0 30px ${selectedRoleData.color}40`
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        CONFIRM & CONTINUE
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {/* Shadow effect */}
                      <div 
                        className="absolute inset-0 translate-x-1 translate-y-1 -z-10 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"
                        style={{ backgroundColor: `${selectedRoleData.color}40` }}
                      />
                    </Button>
                  </div>
                  
                  <p className="text-center mt-4 text-xs text-[#4a6e4a] font-mono">
                    You can change your primary role later in settings
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
              {isLoadingStep && selectedRoleData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#1a2e1a] border-t-[#4ade80] mb-6"
                    style={{ borderTopColor: selectedRoleData.color }}
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg sm:text-xl font-black tracking-tighter text-white mb-2"
                  >
                    {selectedRoleData.loadingMessage}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-[#6b8e6b] font-mono"
                  >
                    Preparing your {selectedRoleData.label.toLowerCase()} experience...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success State */}
            <AnimatePresence>
              {isSuccessStep && selectedRoleData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${selectedRoleData.color}20`, border: `2px solid ${selectedRoleData.color}` }}
                  >
                    <CheckCircle2 className="h-10 w-10" style={{ color: selectedRoleData.color }} />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-black tracking-tighter text-white mb-2"
                  >
                    WELCOME, {selectedRoleData.label}!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-[#6b8e6b] font-mono"
                  >
                    Redirecting to your dashboard...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Button (Selection Step) */}
            <AnimatePresence>
              {isSelectionStep && selectedRole && selectedRoleData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-md mx-auto"
                >
                  {/* Selected Preview */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border-2 mb-4 relative overflow-hidden"
                    style={{ borderColor: selectedRoleData.color }}
                  >
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{ backgroundColor: selectedRoleData.color }}
                    />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono text-[#6b8e6b] mb-1">SELECTED</p>
                        <h4 className="text-lg font-black tracking-tighter text-white">
                          {selectedRoleData.label}
                        </h4>
                      </div>
                      
                      <selectedRoleData.icon 
                        className="h-8 w-8"
                        style={{ color: selectedRoleData.color, opacity: 0.5 }}
                      />
                    </div>
                  </motion.div>

                  <Button
                    onClick={handleContinue}
                    className="w-full h-14 text-base sm:text-lg font-black tracking-wider rounded-none relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050805]"
                    style={{ 
                      backgroundColor: selectedRoleData.color,
                      color: "#000"
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      CONTINUE
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {/* Shadow effect */}
                    <div 
                      className="absolute inset-0 translate-x-1 translate-y-1 -z-10 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"
                      style={{ backgroundColor: `${selectedRoleData.color}40` }}
                    />
                  </Button>
                  
                  <p className="text-center mt-4 text-xs text-[#4a6e4a] font-mono">
                    You can change your primary role later in settings
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State Prompt */}
            <AnimatePresence>
              {isSelectionStep && !selectedRole && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mt-8"
                >
                  <div className="inline-flex items-center gap-2 text-[#4a6e4a] font-mono text-xs sm:text-sm">
                    <Target className="h-4 w-4" />
                    <span>SELECT A PATH ABOVE TO CONTINUE</span>
                    <Target className="h-4 w-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 sm:py-6 px-4 sm:px-6 border-t border-[#1a2e1a]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#4a6e4a]">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-center sm:text-left">WELCOME TO THE MOVEMENT</span>
              <span className="hidden sm:inline text-[#1a2e1a]">|</span>
              <span className="text-[#4ade80]">v1.0.0</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>JOIN 10,000+ MARKED</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
