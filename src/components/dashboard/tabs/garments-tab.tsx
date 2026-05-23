"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Shirt, ShoppingBag, AlertCircle, Plus, Edit, Eye, Sparkles, TrendingUp, DollarSign, ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Garment {
  id: string
  name: string
  designId: string
  designTitle: string
  designImage?: string
  type: "tshirt" | "hoodie" | "tank" | "longsleeve"
  status: "active" | "draft" | "out_of_stock"
  price: number
  inventory: number
  sales: number
  earnings: number
  createdAt: string
}

interface GarmentsTabProps {
  garments: Garment[]
}

const garmentIcons = {
  tshirt: Shirt,
  hoodie: ShoppingBag,
  tank: Shirt,
  longsleeve: Package,
}

const garmentLabels = {
  tshirt: "T-SHIRT",
  hoodie: "HOODIE",
  tank: "TANK TOP",
  longsleeve: "LONG SLEEVE",
}

export function GarmentsTab({ garments }: GarmentsTabProps) {
  // Empty state: No garments
  if (garments.length === 0) {
    return <EmptyGarments />
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-[#6b8e6b]">Total Products:</span>{" "}
            <span className="font-black text-[#e8f5e8]">{garments.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-[#6b8e6b]">Active:</span>{" "}
            <span className="font-black text-[#4ade80]">
              {garments.filter((g) => g.status === "active").length}
            </span>
          </div>
        </div>
        <Link href="/artist/garments/create">
          <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black text-xs">
            <Plus className="h-4 w-4 mr-2" />
            CREATE GARMENT
          </Button>
        </Link>
      </div>

      {/* Garments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {garments.map((garment) => {
          const Icon = garmentIcons[garment.type]
          const isLowStock = garment.inventory > 0 && garment.inventory < 10
          const isOutOfStock = garment.inventory === 0

          return (
            <Card
              key={garment.id}
              className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden"
            >
              {/* Design Preview */}
              <div className="relative aspect-[4/3] bg-[#050805]">
                {garment.designImage ? (
                  <Image
                    src={garment.designImage}
                    alt={garment.designTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-16 w-16 text-[#1a2e1a]" />
                  </div>
                )}
                
                {/* Type Badge */}
                <Badge className="absolute top-2 left-2 rounded-none text-[10px] bg-[#1a2e1a] text-[#6b8e6b]">
                  {garmentLabels[garment.type]}
                </Badge>

                {/* Status Badge */}
                <Badge
                  className={`absolute top-2 right-2 rounded-none text-[10px] ${
                    garment.status === "active"
                      ? "bg-[#4ade80] text-black"
                      : garment.status === "out_of_stock"
                      ? "bg-[#dc2626] text-white"
                      : "bg-[#6b8e6b]/30 text-[#6b8e6b]"
                  }`}
                >
                  {garment.status === "out_of_stock"
                    ? "OUT OF STOCK"
                    : garment.status.toUpperCase()}
                </Badge>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Info */}
                <div>
                  <h3 className="font-black text-[#e8f5e8]">{garment.name}</h3>
                  <p className="text-xs text-[#6b8e6b]">
                    From: {garment.designTitle}
                  </p>
                </div>

                {/* Price & Inventory */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-[#050805] border border-[#1a2e1a]">
                    <div className="text-xs text-[#6b8e6b]">PRICE</div>
                    <div className="font-black text-[#e8f5e8]">
                      ${garment.price}
                    </div>
                  </div>
                  <div
                    className={`p-2 border ${
                      isOutOfStock
                        ? "bg-[#dc2626]/10 border-[#dc2626]/30"
                        : isLowStock
                        ? "bg-[#fbbf24]/10 border-[#fbbf24]/30"
                        : "bg-[#050805] border-[#1a2e1a]"
                    }`}
                  >
                    <div className="text-xs text-[#6b8e6b]">STOCK</div>
                    <div
                      className={`font-black ${
                        isOutOfStock
                          ? "text-[#dc2626]"
                          : isLowStock
                          ? "text-[#fbbf24]"
                          : "text-[#e8f5e8]"
                      }`}
                    >
                      {garment.inventory}
                      {isLowStock && (
                        <AlertCircle className="h-3 w-3 inline ml-1" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#6b8e6b]">Sales:</span>{" "}
                    <span className="font-black text-[#e8f5e8]">
                      {garment.sales}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b8e6b]">Earned:</span>{" "}
                    <span className="font-black text-[#4ade80]">
                      ${garment.earnings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    VIEW
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    EDIT
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Empty State: No garments created
function EmptyGarments() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 md:p-16 text-center">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 bg-[#050805] border-2 border-[#1a2e1a] flex items-center justify-center">
            <Package className="h-12 w-12 text-[#6b8e6b]" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#050805] border border-[#dc2626]/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#dc2626]" />
          </div>
        </div>

        <h3 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          NO GARMENTS CREATED
        </h3>

        <p className="text-[#6b8e6b] font-mono text-sm max-w-lg mx-auto mb-3">
          Garments are physical products created from your tattoo designs. 
          Turn your art into sellable merchandise—t-shirts, hoodies, tanks, and more.
        </p>

        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-10">
          Each garment is linked to a design. When attributed to a partner, 
          they earn royalties from every sale too.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center mb-3">
              <ImageIcon className="h-5 w-5 text-[#dc2626]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">SELECT DESIGN</p>
            <p className="text-xs text-[#6b8e6b]">
              Choose a design from your portfolio to print
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center mb-3">
              <Package className="h-5 w-5 text-[#fbbf24]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">CONFIGURE PRODUCT</p>
            <p className="text-xs text-[#6b8e6b]">
              Set garment type, colors, sizes, and pricing
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mb-3">
              <DollarSign className="h-5 w-5 text-[#4ade80]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">PUBLISH & SELL</p>
            <p className="text-xs text-[#6b8e6b]">
              Make it available in the shop and start earning
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/artist/designs">
            <Button
              variant="outline"
              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] font-black"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              BROWSE DESIGNS
            </Button>
          </Link>
          <Link href="/artist/garments/create">
            <Button
              size="lg"
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider px-8"
            >
              <Plus className="h-5 w-5 mr-2" />
              CREATE FIRST GARMENT
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-[#6b8e6b] font-mono">
          Print-on-demand available • No inventory required • Worldwide shipping
        </p>
      </CardContent>
    </Card>
  )
}
