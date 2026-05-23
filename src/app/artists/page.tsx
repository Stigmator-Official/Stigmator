"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { MapPin, ArrowUpRight, Filter, X, ChevronRight, Star, Hash, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OptimizedAvatar } from "@/components/ui/optimized-image"
import { usePageView } from "@/lib/analytics"
import { useArtists } from "@/lib/query/hooks"

// Parse location into city/country
function parseLocation(location: string | null): { city: string; country: string } {
  if (!location) return { city: "Unknown", country: "Unknown" }
  const parts = location.split(",").map(p => p.trim())
  if (parts.length >= 2) {
    return { city: parts[0], country: parts[parts.length - 1] }
  }
  return { city: location, country: "Unknown" }
}

// Generate specialties from bio
function generateSpecialties(bio: string | null): string[] {
  if (!bio) return ["Custom"]
  const styles = [
    "Japanese", "Traditional", "Neo-Traditional", "Blackwork", 
    "Dotwork", "Geometric", "Watercolor", "Realism", "Minimalist",
    "Abstract", "Fine Line", "Illustrative", "Script", "Portrait"
  ]
  const found = styles.filter(s => bio.toLowerCase().includes(s.toLowerCase()))
  return found.length > 0 ? found.slice(0, 4) : ["Custom"]
}

export default function ArtistsDirectoryPage() {
  usePageView()
  const { data: artists, isLoading, error } = useArtists()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [selectedStyle, setSelectedStyle] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null)

  // Transform and filter artists
  const processedArtists = useMemo(() => {
    if (!artists) return []
    
    return artists.map(artist => {
      const { city, country } = parseLocation(artist.location)
      const specialties = generateSpecialties(artist.bio)
      return {
        id: artist.id,
        name: artist.displayName || artist.fullName || "Unknown",
        avatar: artist.avatarUrl,
        city,
        country,
        bio: artist.bio || "",
        specialties,
        isVerified: artist.isVerified,
        stats: {
          designs: artist.totalDesigns || 0,
          sales: artist.totalSales || 0,
          rating: artist.rating || 5.0,
        },
        featured: artist.isVerified,
      }
    }).filter(artist => {
      const countryMatch = selectedCountry === "all" || artist.country === selectedCountry
      const styleMatch = selectedStyle === "all" || artist.specialties.includes(selectedStyle)
      const searchMatch = searchQuery === "" || 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.country.toLowerCase().includes(searchQuery.toLowerCase())
      return countryMatch && styleMatch && searchMatch
    })
  }, [artists, selectedCountry, selectedStyle, searchQuery])

  // Get all unique values
  const countries = useMemo(() => 
    Array.from(new Set(processedArtists.map(a => a.country))).sort(),
    [processedArtists]
  )
  
  const allStyles = useMemo(() => 
    Array.from(new Set(processedArtists.flatMap(a => a.specialties))).sort(),
    [processedArtists]
  )

  const featuredArtists = processedArtists.filter(a => a.featured)
  const regularArtists = processedArtists.filter(a => !a.featured)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />

  return (
    <div className="min-h-screen bg-[#050805] text-[#e8f5e8] overflow-x-hidden">
      {/* HERO SECTION - Brutalist Typography */}
      <section className="relative min-h-[70vh] flex flex-col justify-end border-b-2 border-[#1a2e1a]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(to right, #4ade80 1px, transparent 1px),
              linear-gradient(to bottom, #4ade80 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Giant Typography */}
        <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 pb-16 pt-32">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 border border-[#4ade80] px-3 py-1">
                <Activity className="h-3 w-3 text-[#4ade80]" />
                <span className="font-mono text-xs text-[#4ade80] tracking-[0.3em]">LIVE DIRECTORY</span>
              </div>
              
              <h1 className="text-[15vw] sm:text-[12vw] lg:text-[10vw] font-black leading-[0.8] tracking-tighter">
                <span className="text-[#e8f5e8]">INK</span>
                <br />
                <span className="text-[#dc2626]">MASTERS</span>
              </h1>
              
              <p className="text-lg text-[#6b8e6b] max-w-md font-mono">
                {processedArtists.length} VERIFIED ARTISTS WORLDWIDE
              </p>
            </div>

            {/* Stats Panel */}
            <div className="flex gap-0 border-2 border-[#1a2e1a] bg-[#0a0f0a]">
              <div className="px-8 py-6 border-r-2 border-[#1a2e1a]">
                <div className="text-5xl font-black text-[#4ade80]">{processedArtists.length}</div>
                <div className="text-xs font-mono text-[#6b8e6b] tracking-wider mt-1">ARTISTS</div>
              </div>
              <div className="px-8 py-6 border-r-2 border-[#1a2e1a]">
                <div className="text-5xl font-black text-[#dc2626]">{countries.length}</div>
                <div className="text-xs font-mono text-[#6b8e6b] tracking-wider mt-1">COUNTRIES</div>
              </div>
              <div className="px-8 py-6">
                <div className="text-5xl font-black text-[#f97316]">{allStyles.length}</div>
                <div className="text-xs font-mono text-[#6b8e6b] tracking-wider mt-1">STYLES</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal Slash */}
        <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-bl from-[#4ade80] to-transparent" 
               style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
        </div>
      </section>

      {/* FILTER BAR - Industrial Style */}
      <section className="sticky top-0 z-40 bg-[#050805]/95 backdrop-blur border-b-2 border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96 group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3a4e3a] group-focus-within:text-[#4ade80] transition-colors" />
              <Input
                placeholder="SEARCH ARTISTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 bg-transparent border-2 border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#3a4e3a] focus:border-[#4ade80] font-mono tracking-wider uppercase"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-[#4ade80]" />
              
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="h-14 px-4 bg-transparent border-2 border-[#1a2e1a] text-[#e8f5e8] font-mono text-sm tracking-wider uppercase focus:border-[#4ade80] focus:outline-none cursor-pointer hover:border-[#4ade80]/50 transition-colors"
              >
                <option value="all" className="bg-[#050805]">ALL REGIONS</option>
                {countries.map(c => (
                  <option key={c} value={c} className="bg-[#050805]">{c.toUpperCase()}</option>
                ))}
              </select>

              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="h-14 px-4 bg-transparent border-2 border-[#1a2e1a] text-[#e8f5e8] font-mono text-sm tracking-wider uppercase focus:border-[#4ade80] focus:outline-none cursor-pointer hover:border-[#4ade80]/50 transition-colors"
              >
                <option value="all" className="bg-[#050805]">ALL STYLES</option>
                {allStyles.map(s => (
                  <option key={s} value={s} className="bg-[#050805]">{s.toUpperCase()}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {(selectedCountry !== "all" || selectedStyle !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCountry("all")
                    setSelectedStyle("all")
                    setSearchQuery("")
                  }}
                  className="h-14 px-4 border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white transition-colors font-mono text-sm tracking-wider uppercase flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  CLEAR
                </button>
              )}

              <Link href="/artist/apply" className="ml-auto">
                <Button className="h-14 bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none border-2 border-[#4ade80] tracking-wider">
                  APPLY
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
            <span>SHOWING {processedArtists.length} RESULTS</span>
            {processedArtists.length > 0 && (
              <>
                <span className="text-[#3a4e3a]">|</span>
                <span className="text-[#4ade80]">{featuredArtists.length} FEATURED</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 py-16">
        {/* Empty State */}
        {processedArtists.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-[#1a2e1a]">
            <div className="text-6xl font-black text-[#3a4e3a] mb-4">404</div>
            <p className="text-[#6b8e6b] font-mono text-lg uppercase tracking-wider">No artists found</p>
            <p className="text-[#4ade80] mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Featured Section - Large Cards */}
        {featuredArtists.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-[2px] bg-[#f97316]" />
              <span className="font-mono text-sm text-[#f97316] tracking-[0.3em] uppercase">Featured Artists</span>
              <div className="flex-1 h-[2px] bg-[#1a2e1a]" />
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredArtists.map((artist, i) => (
                <FeaturedArtistCard key={artist.id} artist={artist} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Artists - Asymmetric Grid */}
        {regularArtists.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-[2px] bg-[#4ade80]" />
              <span className="font-mono text-sm text-[#4ade80] tracking-[0.3em] uppercase">All Artists</span>
              <div className="flex-1 h-[2px] bg-[#1a2e1a]" />
            </div>

            {/* Masonry-like Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
              {regularArtists.map((artist, i) => (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist} 
                  index={i}
                  isHovered={hoveredArtist === artist.id}
                  onHover={setHoveredArtist}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer Stats Bar */}
      <footer className="border-t-2 border-[#1a2e1a] bg-[#0a0f0a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono text-xs text-[#6b8e6b] tracking-wider uppercase">
              Stigmator Artist Directory © 2024
            </p>
            <div className="flex gap-8 text-xs font-mono">
              <span className="text-[#4ade80]">{processedArtists.length} ARTISTS</span>
              <span className="text-[#dc2626]">{countries.length} COUNTRIES</span>
              <span className="text-[#f97316]">{allStyles.length} STYLES</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// LOADING STATE
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#050805] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-black text-[#3a4e3a] animate-pulse">LOADING</div>
        <div className="text-[#4ade80] font-mono text-sm mt-4 tracking-wider">INITIALIZING DIRECTORY...</div>
      </div>
    </div>
  )
}

// ERROR STATE
function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong"
  return (
    <div className="min-h-screen bg-[#050805] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl font-black text-[#dc2626] mb-4">ERROR</div>
        <p className="text-[#6b8e6b] font-mono mb-6">{message}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black rounded-none"
        >
          RETRY
        </Button>
      </div>
    </div>
  )
}

// FEATURED ARTIST CARD - Large, Bold
function FeaturedArtistCard({ artist, index }: { artist: any; index: number }) {
  return (
    <div>
      <Link href={`/artists/${artist.id}`} className="group block h-full">
        <div className="relative h-full bg-[#0a0f0a] border-2 border-[#1a2e1a] hover:border-[#f97316] transition-colors overflow-hidden">
          {/* Number Badge */}
          <div className="absolute top-0 left-0 bg-[#f97316] text-[#080a08] px-3 py-1 z-10">
            <span className="font-black text-lg">0{index + 1}</span>
          </div>

          {/* Image Area */}
          <div className="h-64 bg-gradient-to-br from-[#1a2e1a] to-[#0d120d] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM0YWRlODAiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
            
            {/* Avatar */}
            <div className="absolute bottom-4 left-4">
              <OptimizedAvatar
                src={artist.avatar}
                alt={artist.name}
                size="xl"
                className="border-4 border-[#0a0f0a] bg-[#1a2e1a]"
              />
            </div>

            {/* Verified Badge */}
            {artist.isVerified && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[#4ade80]">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-mono text-xs tracking-wider">VERIFIED</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-2xl font-black text-[#e8f5e8] mb-2 group-hover:text-[#f97316] transition-colors tracking-tight">
              {artist.name}
            </h3>

            <div className="flex items-center gap-2 text-[#6b8e6b] mb-4 font-mono text-sm">
              <MapPin className="h-3 w-3" />
              <span>{artist.city}, {artist.country}</span>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-6">
              {artist.specialties.map((s: string) => (
                <span key={s} className="text-xs font-mono px-2 py-1 border border-[#1a2e1a] text-[#6b8e6b]">
                  {s.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-[#1a2e1a]">
              <div>
                <div className="text-2xl font-black text-[#4ade80]">{artist.stats.designs}</div>
                <div className="text-[10px] font-mono text-[#6b8e6b] tracking-wider">DESIGNS</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#dc2626]">{artist.stats.sales}</div>
                <div className="text-[10px] font-mono text-[#6b8e6b] tracking-wider">SALES</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#f97316]">{artist.stats.rating}</div>
                <div className="text-[10px] font-mono text-[#6b8e6b] tracking-wider">RATING</div>
              </div>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-6 w-6 text-[#f97316]" />
          </div>
        </div>
      </Link>
    </div>
  )
}

// REGULAR ARTIST CARD - Minimal, Grid
function ArtistCard({ 
  artist, 
  index, 
  isHovered, 
  onHover 
}: { 
  artist: any; 
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) {
  return (
    <div onMouseEnter={() => onHover(artist.id)} onMouseLeave={() => onHover(null)}>
      <Link href={`/artists/${artist.id}`} className="group block">
        <div className={`
          relative bg-[#0a0f0a] border-2 transition-all duration-300
          ${isHovered ? 'border-[#4ade80] z-10' : 'border-[#0d120d]'}
        `}>
          {/* Top Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#0d120d] bg-[#050805]">
            <span className="text-[10px] font-mono text-[#5a6e5a] tracking-wider">
              ID: {artist.id.slice(0, 8).toUpperCase()}
            </span>
            {artist.isVerified && (
              <Star className="h-3 w-3 text-[#4ade80] fill-current" />
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <OptimizedAvatar
                src={artist.avatar}
                alt={artist.name}
                size="md"
                className="border-2 border-[#1a2e1a]"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-[#e8f5e8] truncate group-hover:text-[#4ade80] transition-colors">
                  {artist.name}
                </h3>
                <p className="text-xs font-mono text-[#6b8e6b] truncate">
                  {artist.city}, {artist.country}
                </p>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-4">
              {artist.specialties.slice(0, 2).map((s: string) => (
                <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1a2e1a]/30 text-[#6b8e6b]">
                  {s.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="flex justify-between text-xs font-mono pt-3 border-t border-[#1a2e1a]/30">
              <span className="text-[#4ade80]">{artist.stats.designs}D</span>
              <span className="text-[#dc2626]">{artist.stats.sales}S</span>
              <span className="text-[#f97316]">{artist.stats.rating}★</span>
            </div>
          </div>

          {/* Hover Overlay */}
          <div className={`
            absolute inset-0 bg-[#4ade80]/5 pointer-events-none transition-opacity
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `} />
        </div>
      </Link>
    </div>
  )
}
