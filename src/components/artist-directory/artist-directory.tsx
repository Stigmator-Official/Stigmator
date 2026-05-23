"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { MapPin, Users, Building2, User, CheckCircle, Star, ArrowRight, Globe, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedAvatar } from "@/components/ui/optimized-image"

// Types
interface Artist {
  id: string
  type: "artist" | "studio"
  name: string
  displayName?: string
  avatar?: string
  coverImage?: string
  location: string
  country: string
  city: string
  bio?: string
  specialties: string[]
  isVerified: boolean
  isApproved: boolean
  stats: {
    designs: number
    sales: number
    rating: number
    reviewCount: number
  }
  social?: {
    instagram?: string
    website?: string
  }
  artists?: string[] // For studios - list of artists at this studio
  featured?: boolean
}

// Real data will populate from API once artists apply and are approved
const MOCK_ARTISTS: Artist[] = []

export function ArtistDirectory() {
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<"all" | "artist" | "studio">("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")

  // Get unique countries and cities
  const countries = useMemo(() => {
    const unique = new Set(MOCK_ARTISTS.map(a => a.country))
    return Array.from(unique).sort()
  }, [])

  const cities = useMemo(() => {
    const filtered = selectedCountry === "all" 
      ? MOCK_ARTISTS 
      : MOCK_ARTISTS.filter(a => a.country === selectedCountry)
    const unique = new Set(filtered.map(a => a.city))
    return Array.from(unique).sort()
  }, [selectedCountry])

  // Filter artists
  const filteredArtists = useMemo(() => {
    return MOCK_ARTISTS.filter(artist => {
      const countryMatch = selectedCountry === "all" || artist.country === selectedCountry
      const typeMatch = selectedType === "all" || artist.type === selectedType
      const cityMatch = selectedCity === "all" || artist.city === selectedCity
      return countryMatch && typeMatch && cityMatch && artist.isApproved
    })
  }, [selectedCountry, selectedType, selectedCity])

  const featuredArtists = useMemo(() => {
    return filteredArtists.filter(a => a.featured).slice(0, 3)
  }, [filteredArtists])

  const regularArtists = useMemo(() => {
    return filteredArtists.filter(a => !a.featured)
  }, [filteredArtists])

  return (
    <section className="relative py-24 border-t border-[#1a2e1a] bg-[#0a0f0a]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 gap-6">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#4ade80] mb-4 block">[DIRECTORY]</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#e8f5e8] mb-4">
              FIND <span className="text-[#dc2626]">ARTISTS</span>
              <br />& STUDIOS
            </h2>
            <p className="text-lg text-[#6b8e6b] max-w-xl">
              Discover verified tattoo artists and studios worldwide. 
              All approved artists automatically appear here.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-[#4ade80]">{MOCK_ARTISTS.filter(a => a.type === "artist").length}+</div>
              <div className="text-xs font-mono text-[#6b8e6b] tracking-wider">ARTISTS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#dc2626]">{MOCK_ARTISTS.filter(a => a.type === "studio").length}+</div>
              <div className="text-xs font-mono text-[#6b8e6b] tracking-wider">STUDIOS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#f97316]">{countries.length}</div>
              <div className="text-xs font-mono text-[#6b8e6b] tracking-wider">COUNTRIES</div>
            </div>
          </div>
        </div>

        {MOCK_ARTISTS.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-12 p-6 bg-[#050805] border border-[#1a2e1a]">
          <div className="flex items-center gap-2 text-[#4ade80] mr-4">
            <Filter className="h-4 w-4" />
            <span className="font-mono text-xs tracking-wider">FILTER BY:</span>
          </div>

          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value)
              setSelectedCity("all")
            }}
            className="bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] px-4 py-2 text-sm font-mono tracking-wider focus:border-[#4ade80] focus:outline-none"
          >
            <option value="all">ALL COUNTRIES</option>
            {countries.map(country => (
              <option key={country} value={country}>{country.toUpperCase()}</option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] px-4 py-2 text-sm font-mono tracking-wider focus:border-[#4ade80] focus:outline-none"
          >
            <option value="all">ALL CITIES</option>
            {cities.map(city => (
              <option key={city} value={city}>{city.toUpperCase()}</option>
            ))}
          </select>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 text-sm font-mono tracking-wider border transition-colors ${
                selectedType === "all" 
                  ? "bg-[#4ade80] text-[#080a08] border-[#4ade80]" 
                  : "bg-[#0a0f0a] text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedType("artist")}
              className={`px-4 py-2 text-sm font-mono tracking-wider border transition-colors flex items-center gap-2 ${
                selectedType === "artist" 
                  ? "bg-[#4ade80] text-[#080a08] border-[#4ade80]" 
                  : "bg-[#0a0f0a] text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
              }`}
            >
              <User className="h-3 w-3" />
              ARTISTS
            </button>
            <button
              onClick={() => setSelectedType("studio")}
              className={`px-4 py-2 text-sm font-mono tracking-wider border transition-colors flex items-center gap-2 ${
                selectedType === "studio" 
                  ? "bg-[#4ade80] text-[#080a08] border-[#4ade80]" 
                  : "bg-[#0a0f0a] text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
              }`}
            >
              <Building2 className="h-3 w-3" />
              STUDIOS
            </button>
          </div>
        </div>
        )}

        {/* Featured Section */}
        {featuredArtists.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-4 w-4 text-[#f97316]" />
              <span className="font-mono text-xs tracking-widest text-[#f97316]">FEATURED</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtists.map(artist => (
                <FeaturedArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regularArtists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>

        {/* Empty State */}
        {filteredArtists.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[#1a2e1a] bg-[#050805]">
            <p className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
              THE CANVAS IS <span className="text-[#dc2626]">EMPTY</span>
            </p>
            <p className="text-[#6b8e6b] font-mono mb-2 max-w-md mx-auto">
              No artists listed yet. Be the first to join the revolution.
            </p>
            <p className="text-[#4ade80] text-sm mb-8">
              All approved artists automatically appear here.
            </p>
            <Link href="/artist/apply">
              <Button 
                variant="outline" 
                className="group font-black tracking-wider px-8 py-6 text-lg rounded-none border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10"
              >
                APPLY AS ARTIST
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* View All Link */}
        {MOCK_ARTISTS.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/artists">
            <Button 
              variant="outline" 
              className="group font-black tracking-wider px-8 py-6 text-lg rounded-none border-2 border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10"
            >
              VIEW ALL ARTISTS
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        )}
      </div>
    </section>
  )
}

function FeaturedArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.id}`} className="group">
      <div className="relative h-full border-2 border-[#f97316]/50 bg-[#0a0f0a] overflow-hidden hover:border-[#f97316] transition-all duration-300">
        {/* Featured Badge */}
        <div className="absolute top-0 right-0 bg-[#f97316] text-[#080a08] px-3 py-1 z-10">
          <span className="font-mono text-xs font-black tracking-wider">FEATURED</span>
        </div>

        {/* Cover */}
        <div className="h-40 bg-gradient-to-br from-[#1a2e1a] to-[#0d120d] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f0a]" />
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-mono tracking-wider ${
              artist.type === "studio" 
                ? "bg-[#dc2626]/20 text-[#dc2626]" 
                : "bg-[#4ade80]/20 text-[#4ade80]"
            }`}>
              {artist.type === "studio" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {artist.type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-4 mb-4">
            <OptimizedAvatar
              src={artist.avatar || null}
              alt={artist.name}
              size="xl"
              className="border-4 border-[#0a0f0a] bg-[#1a2e1a]"
            />
            <div className="mb-2">
              {artist.isVerified && (
                <div className="flex items-center gap-1 text-[#4ade80] mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-mono">VERIFIED</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-black text-xl text-[#e8f5e8] mb-1 group-hover:text-[#f97316] transition-colors">
            {artist.name}
          </h3>

          <div className="flex items-center gap-1 text-sm text-[#6b8e6b] mb-3">
            <MapPin className="h-3 w-3" />
            <span>{artist.location}</span>
          </div>

          {artist.bio && (
            <p className="text-sm text-[#6b8e6b] line-clamp-2 mb-4">
              {artist.bio}
            </p>
          )}

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {artist.specialties.slice(0, 3).map(specialty => (
              <span 
                key={specialty} 
                className="text-xs font-mono px-2 py-1 bg-[#1a2e1a] text-[#4ade80]"
              >
                {specialty.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#1a2e1a]">
            <div className="text-center">
              <p className="font-black text-[#4ade80]">{artist.stats.designs}</p>
              <p className="text-xs text-[#6b8e6b] font-mono">DESIGNS</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#dc2626]">{artist.stats.sales}</p>
              <p className="text-xs text-[#6b8e6b] font-mono">SALES</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f97316]">{artist.stats.rating}</p>
              <p className="text-xs text-[#6b8e6b] font-mono">RATING</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.id}`} className="group">
      <div className="relative h-full border border-[#1a2e1a] bg-[#0a0f0a] overflow-hidden hover:border-[#4ade80] transition-all duration-300">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-br from-[#1a2e1a] to-[#0d120d] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f0a]" />
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono ${
              artist.type === "studio" 
                ? "bg-[#dc2626]/20 text-[#dc2626]" 
                : "bg-[#4ade80]/20 text-[#4ade80]"
            }`}>
              {artist.type === "studio" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 -mt-10 relative">
          <div className="flex items-end gap-3 mb-3">
            <OptimizedAvatar
              src={artist.avatar || null}
              alt={artist.name}
              size="lg"
              className="border-4 border-[#0a0f0a] bg-[#1a2e1a]"
            />
            {artist.isVerified && (
              <CheckCircle className="h-4 w-4 text-[#4ade80] mb-1" />
            )}
          </div>

          <h3 className="font-black text-lg text-[#e8f5e8] mb-1 group-hover:text-[#4ade80] transition-colors truncate">
            {artist.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-[#6b8e6b] mb-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{artist.city}, {artist.country}</span>
          </div>

          {/* Studio Artists Count */}
          {artist.type === "studio" && artist.artists && (
            <div className="flex items-center gap-1 text-xs text-[#4ade80] mb-2">
              <Users className="h-3 w-3" />
              <span>{artist.artists.length} artists</span>
            </div>
          )}

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mt-3">
            {artist.specialties.slice(0, 2).map(specialty => (
              <span 
                key={specialty} 
                className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1a2e1a] text-[#6b8e6b]"
              >
                {specialty.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Mini Stats */}
          <div className="flex justify-between mt-4 pt-3 border-t border-[#1a2e1a]">
            <div className="text-xs">
              <span className="text-[#4ade80] font-black">{artist.stats.designs}</span>
              <span className="text-[#6b8e6b] ml-1 font-mono">D</span>
            </div>
            <div className="text-xs">
              <span className="text-[#dc2626] font-black">{artist.stats.sales}</span>
              <span className="text-[#6b8e6b] ml-1 font-mono">S</span>
            </div>
            <div className="text-xs">
              <span className="text-[#f97316] font-black">{artist.stats.rating}</span>
              <span className="text-[#6b8e6b] ml-1 font-mono">★</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
