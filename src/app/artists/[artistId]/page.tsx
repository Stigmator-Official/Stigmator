"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Instagram, Globe, Mail, Heart, Share2, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientBrowser } from "@/lib/supabase/client"

interface Artist {
  id: string
  name: string
  handle: string
  location: string
  bio: string
  specialty: string
  instagram: string | null
  website: string | null
  email: string | null
  avatar_url: string | null
  cover_url: string | null
  followers: number
  total_sales: number
  rating: number
  joined_at: string
}

interface Design {
  id: string
  name: string
  image_url: string | null
  sales: number
}

export default function ArtistProfilePage() {
  const params = useParams()
  const artistId = typeof params.artistId === 'string' ? params.artistId : Array.isArray(params.artistId) ? params.artistId[0] : undefined
  
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [designs, setDesigns] = useState<Design[]>([])

  useEffect(() => {
    if (artistId) {
      loadArtistData(artistId)
    }
  }, [artistId])

  const loadArtistData = async (id: string) => {
    setLoading(true)
    try {
      const supabase = createClientBrowser()
      
      // Fetch artist profile
      const { data: userData } = await supabase
        .from("users")
        .select("id, display_name, full_name, bio, location, instagram_handle, website, email, avatar_url, created_at")
        .eq("id", id)
        .eq("role", "ARTIST")
        .single()
      
      if (userData) {
        setArtist({
          id: userData.id,
          name: userData.display_name || userData.full_name || "Unknown Artist",
          handle: `@${(userData.display_name || userData.full_name || "artist").toLowerCase().replace(/\s+/g, "")}`,
          location: userData.location || "Unknown",
          bio: userData.bio || "",
          specialty: "Tattoo Artist",
          instagram: userData.instagram_handle,
          website: userData.website,
          email: userData.email,
          avatar_url: userData.avatar_url,
          cover_url: null,
          followers: 0,
          total_sales: 0,
          rating: 5.0,
          joined_at: userData.created_at,
        })
      }
      
      // Fetch designs
      const { data: designsData } = await supabase
        .from("designs")
        .select("id, title, images")
        .eq("artist_id", id)
        .order("created_at", { ascending: false })
      
      if (designsData) {
        setDesigns(designsData.map((d: any) => ({
          id: d.id,
          name: d.title,
          image_url: d.images?.[0] || null,
          sales: 0,
        })))
      }
    } catch {
      setArtist(null)
      setDesigns([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center texture-grain">
        <Loader2 className="h-12 w-12 text-[#4ade80] animate-spin" />
      </div>
    )
  }

  if (!artist && !loading) {
    return (
      <div className="min-h-screen pt-32 texture-grain">
        <div className="max-w-[600px] mx-auto px-4 text-center">
          <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-4">
            ARTIST NOT FOUND
          </h1>
          <p className="text-[#6b8e6b] mb-6">
            This artist profile doesn&apos;t exist or has been removed.
          </p>
          <Link href="/artists">
            <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
              BROWSE ARTISTS
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen texture-grain">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 bg-[#0a0f0a] relative">
        {artist?.cover_url ? (
          <img 
            src={artist.cover_url} 
            alt="" 
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#1a2e1a] to-[#0a0f0a]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080a08]" />
        
        {/* Back Button */}
        <Link 
          href="/artists"
          className="absolute top-24 left-4 sm:left-8 inline-flex items-center text-[#e8f5e8] hover:text-[#4ade80] font-mono text-xs bg-black/50 px-3 py-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          BACK TO ARTISTS
        </Link>
      </div>

      {/* Profile Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 -mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Artist Info */}
          <div className="lg:col-span-1">
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="w-32 h-32 mx-auto -mt-20 mb-4 border-4 border-[#0a0f0a] bg-[#1a2e1a] overflow-hidden flex items-center justify-center">
                  {artist?.avatar_url ? (
                    <img 
                      src={artist.avatar_url} 
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-[#6b8e6b]" />
                  )}
                </div>

                {/* Name & Handle */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
                    {artist?.name || "ARTIST NAME"}
                  </h1>
                  <p className="text-[#6b8e6b] font-mono text-sm">{artist?.handle || "@artist"}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center p-2 bg-[#050805]">
                    <p className="text-lg font-black text-[#4ade80]">
                      {artist?.followers ? (artist.followers / 1000).toFixed(1) + "K" : "—"}
                    </p>
                    <p className="text-xs text-[#6b8e6b]">FOLLOWERS</p>
                  </div>
                  <div className="text-center p-2 bg-[#050805]">
                    <p className="text-lg font-black text-[#4ade80]">
                      {artist?.total_sales?.toLocaleString() || "—"}
                    </p>
                    <p className="text-xs text-[#6b8e6b]">SALES</p>
                  </div>
                  <div className="text-center p-2 bg-[#050805]">
                    <p className="text-lg font-black text-[#4ade80]">{artist?.rating || "—"}</p>
                    <p className="text-xs text-[#6b8e6b]">RATING</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-6">
                  <Button className="flex-1 bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none h-12">
                    <Heart className="h-4 w-4 mr-2" />
                    FOLLOW
                  </Button>
                  <Button variant="outline" className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none h-12 px-4">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bio */}
                <p className="text-sm text-[#e8f5e8] mb-4 leading-relaxed">
                  {artist?.bio || "No bio available."}
                </p>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {artist?.location && (
                    <div className="flex items-center gap-2 text-[#6b8e6b]">
                      <MapPin className="h-4 w-4" />
                      <span>{artist.location}</span>
                    </div>
                  )}
                  {artist?.instagram && (
                    <div className="flex items-center gap-2 text-[#6b8e6b]">
                      <Instagram className="h-4 w-4" />
                      <span>{artist.instagram}</span>
                    </div>
                  )}
                  {artist?.website && (
                    <div className="flex items-center gap-2 text-[#6b8e6b]">
                      <Globe className="h-4 w-4" />
                      <span>{artist.website}</span>
                    </div>
                  )}
                  {artist?.email && (
                    <div className="flex items-center gap-2 text-[#6b8e6b]">
                      <Mail className="h-4 w-4" />
                      <span>{artist.email}</span>
                    </div>
                  )}
                </div>

                {/* Specialty */}
                {artist?.specialty && (
                  <div className="mt-6 pt-4 border-t border-[#1a2e1a]">
                    <p className="text-xs font-mono text-[#6b8e6b] mb-1">SPECIALTY</p>
                    <p className="font-black text-[#e8f5e8]">{artist.specialty}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Designs */}
            <div>
              <h2 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-4">
                TOP DESIGNS
              </h2>
              {designs.length > 0 ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {designs.map((design) => (
                    <Card key={design.id} className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none group cursor-pointer">
                      <div className="aspect-square bg-[#050805] overflow-hidden flex items-center justify-center">
                        {design.image_url ? (
                          <img 
                            src={design.image_url} 
                            alt={design.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-[#6b8e6b]" />
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-black text-[#e8f5e8] text-sm truncate">
                          {design.name}
                        </h3>
                        <p className="text-xs text-[#4ade80]">{design.sales} sales</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-[#1a2e1a] text-center">
                  <ImageIcon className="h-10 w-10 text-[#6b8e6b] mx-auto mb-3" />
                  <p className="text-[#6b8e6b]">No designs published yet</p>
                </div>
              )}
            </div>

            {/* Shop CTA */}
            <div className="p-6 border border-[#4ade80] bg-[#4ade80]/5">
              <h3 className="font-black text-[#e8f5e8] mb-2">
                SHOP {artist?.name || "ARTIST"}&apos;S COLLECTION
              </h3>
              <p className="text-sm text-[#6b8e6b] mb-4">
                Browse all wearable art and merchandise from this artist
              </p>
              <Link href="/shop">
                <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none">
                  VIEW SHOP
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
