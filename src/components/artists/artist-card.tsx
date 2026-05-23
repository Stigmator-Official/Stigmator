"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Palette, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArtistCardProps {
  artist: {
    id: string
    display_name: string
    avatar_url: string | null
    location: string | null
    bio: string | null
    instagram_handle: string | null
    designs: { count: number }[]
    studios: {
      studio: {
        name: string
        city: string | null
        country: string | null
      }
    }[]
  }
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const primaryStudio = artist.studios?.[0]?.studio
  const designCount = artist.designs?.[0]?.count || 0

  return (
    <div className="group bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden hover:border-red-500/30 transition-all duration-300">
      {/* Banner/Header */}
      <div className="h-24 bg-gradient-to-r from-red-900/30 to-purple-900/30 relative">
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-full bg-muted border-4 border-background flex items-center justify-center overflow-hidden">
            {artist.avatar_url ? (
              <Image
                src={artist.avatar_url}
                alt={artist.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-red-400">
                {artist.display_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 pb-6 px-4">
        <h3 className="font-bold text-lg mb-1">{artist.display_name}</h3>
        
        {primaryStudio && (
          <p className="text-sm text-muted-foreground mb-3">
            {primaryStudio.name}
          </p>
        )}

        {artist.location && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            <span>{artist.location}</span>
          </div>
        )}

        {artist.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {artist.bio}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm">
            <Palette className="h-4 w-4 text-red-500" />
            <span>{designCount} designs</span>
          </div>
          
          {artist.instagram_handle && (
            <a
              href={`https://instagram.com/${artist.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
        </div>

        <Link href={`/artists/${artist.display_name}`}>
          <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}
