"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  productDesign: {
    id: string
    mockup_images: string[]
    price_override: number | null
    deposit_amount: number
    product: {
      name: string
      base_price: number
      category: {
        name: string
      }
    }
    design: {
      title: string
      artist: {
        display_name: string
        avatar_url: string | null
      }
    }
    has_partnership?: boolean
    partner_count?: number
  }
}

export function ProductCard({ productDesign }: ProductCardProps) {
  const price = productDesign.price_override || productDesign.product.base_price
  const imageUrl = productDesign.mockup_images[0]
  const hasPartnership = productDesign.has_partnership || Math.random() > 0.5 // Demo: random
  const partnerCount = productDesign.partner_count || Math.floor(Math.random() * 5) + 1

  return (
    <article className="bg-black p-4 group hover:bg-white/[0.02] transition-colors border border-white/5 hover:border-red-600/30 motion-reduce:transition-none">
      {/* Image Container */}
      <div className="aspect-[3/4] bg-white/5 mb-4 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${productDesign.design.title} - ${productDesign.product.name} by ${productDesign.design.artist.display_name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20" aria-hidden="true">🎨</span>
            <span className="sr-only">No image available</span>
          </div>
        )}
        
        {/* Partnership Badge */}
        {hasPartnership && (
          <div className="absolute top-4 left-4 bg-red-600 px-2 py-1 flex items-center space-x-1" aria-label={`${partnerCount} partners on this design`}>
            <Users className="h-3 w-3" aria-hidden="true" />
            <span className="text-[10px] font-black tracking-wider">
              {partnerCount} PARTNERS
            </span>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-black/80 rounded-none border border-white/20 hover:border-red-600 hover:text-red-600"
            aria-label={`Add ${productDesign.design.title} to wishlist`}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 text-[10px] font-mono bg-black/80 border border-white/20">
            {productDesign.product.category.name.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-red-600/20 flex items-center justify-center" aria-hidden="true">
          <span className="text-[10px] text-red-400">
            {productDesign.design.artist.display_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <Link
          href={`/artists/${productDesign.design.artist.display_name}`}
          className="text-xs font-mono text-muted-foreground hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded px-1 -mx-1"
        >
          {productDesign.design.artist.display_name.toUpperCase()}
        </Link>
      </div>

      <h3 className="font-black tracking-tighter mb-1 text-lg">
        {productDesign.design.title.toUpperCase()}
      </h3>
      <p className="text-xs text-muted-foreground font-mono mb-3">
        {productDesign.product.name.toUpperCase()}
      </p>

      {/* Partnership Indicator */}
      {hasPartnership && (
        <div className="mb-3 p-2 bg-red-600/10 border border-red-600/20">
          <p className="text-[10px] font-mono text-red-400">
            EQUITY INK ACTIVE
          </p>
          <p className="text-[10px] text-muted-foreground">
            Partners earn {partnerCount > 1 ? 'splits' : 'split'} on this design
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-red-600">
            ${(price / 100).toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            + ${(productDesign.deposit_amount / 100).toFixed(2)} DEPOSIT
          </span>
        </div>
        <Link href={`/shop/${productDesign.id}`}>
          <Button 
            size="sm" 
            className="rounded-none bg-white/10 hover:bg-red-600 text-xs font-mono tracking-wider"
            aria-label={`View ${productDesign.design.title} details`}
          >
            ACQUIRE
          </Button>
        </Link>
      </div>
    </article>
  )
}
