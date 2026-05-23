"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Search,
  TrendingUp,
  Gift,
} from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  garmentId: string
  designTitle: string
  garmentType: string
  size: string
  color: string
  price: number
  quantity: number
}

interface Order {
  id: string
  customerId?: string
  customerName?: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  tracking?: string
  eta?: string
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
}

interface OrdersTabProps {
  orders: Order[]
}

const statusConfig = {
  pending: {
    label: "PENDING",
    color: "#fbbf24",
    icon: Clock,
    bgColor: "bg-[#fbbf24]",
  },
  processing: {
    label: "PROCESSING",
    color: "#60a5fa",
    icon: Package,
    bgColor: "bg-[#60a5fa]",
  },
  shipped: {
    label: "SHIPPED",
    color: "#4ade80",
    icon: Truck,
    bgColor: "bg-[#4ade80]",
  },
  delivered: {
    label: "DELIVERED",
    color: "#6b8e6b",
    icon: CheckCircle,
    bgColor: "bg-[#6b8e6b]",
  },
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-0">
        {/* Order Header */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Order Info */}
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 flex items-center justify-center"
                style={{ backgroundColor: `${status.color}15` }}
              >
                <StatusIcon className="h-6 w-6" style={{ color: status.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-[#e8f5e8]">ORDER #{order.id.slice(-8).toUpperCase()}</h4>
                  <Badge 
                    className={`${status.bgColor} text-black rounded-none text-[10px] font-black`}
                  >
                    {status.label}
                  </Badge>
                </div>
                <p className="text-xs text-[#6b8e6b] font-mono mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" • "}
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Order Total & Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-black text-[#60a5fa]">${order.total}</div>
                <p className="text-xs text-[#6b8e6b] font-mono">TOTAL</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Tracking Info (if shipped/delivered) */}
          {(order.status === "shipped" || order.status === "delivered") && order.tracking && (
            <div className="mt-4 p-3 bg-[#050805] border border-[#1a2e1a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#60a5fa]" />
                <span className="text-xs text-[#6b8e6b] font-mono">TRACKING:</span>
                <span className="text-sm font-black text-[#e8f5e8] font-mono">{order.tracking}</span>
              </div>
              {order.eta && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#4ade80]" />
                  <span className="text-xs text-[#6b8e6b]">ETA: {order.eta}</span>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-none border-[#60a5fa]/50 text-[#60a5fa] hover:bg-[#60a5fa]/10 text-xs font-black"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                TRACK
              </Button>
            </div>
          )}
        </div>

        {/* Expanded Order Details */}
        {expanded && (
          <div className="border-t border-[#1a2e1a] p-4 md:p-6">
            <h5 className="text-xs font-black text-[#6b8e6b] mb-4 tracking-wider">ORDER ITEMS</h5>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-3 bg-[#050805] border border-[#1a2e1a]"
                >
                  {/* Item Image Placeholder */}
                  <div className="w-16 h-16 bg-[#0a0f0a] flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-[#1a2e1a]" />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h6 className="font-black text-[#e8f5e8] text-sm truncate">{item.designTitle}</h6>
                    <p className="text-xs text-[#6b8e6b]">
                      {item.garmentType} • {item.size} • {item.color}
                    </p>
                  </div>

                  {/* Item Price & Qty */}
                  <div className="text-right">
                    <div className="font-black text-[#e8f5e8]">${item.price}</div>
                    <div className="text-xs text-[#6b8e6b]">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-[#1a2e1a]">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8e6b]">Subtotal</span>
                <span className="text-[#e8f5e8]">${Math.round(order.total * 0.9)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#6b8e6b]">Shipping</span>
                <span className="text-[#e8f5e8]">${Math.round(order.total * 0.1)}</span>
              </div>
              <div className="flex justify-between font-black text-[#60a5fa] mt-2 pt-2 border-t border-[#1a2e1a]">
                <span>TOTAL</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function OrdersTab({ orders }: OrdersTabProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "shipped" | "delivered">("all")

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  // Empty state: No orders at all
  if (orders.length === 0) {
    return <EmptyOrders />
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "processing", "shipped", "delivered"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={`rounded-none text-xs font-black ${
              filter === f
                ? "bg-[#60a5fa] text-black"
                : "border-[#1a2e1a] text-[#6b8e6b]"
            }`}
          >
            {f.toUpperCase()}
            <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded-full text-[10px]">
              {orderCounts[f]}
            </span>
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
              <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                NO {filter === "all" ? "" : filter.toUpperCase()} ORDERS
              </h3>
              <p className="text-[#6b8e6b] font-mono text-sm">
                {filter === "all" 
                  ? "You haven't placed any orders yet." 
                  : `No orders with "${filter}" status found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}

// Empty State: No orders yet
function EmptyOrders() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 md:p-16 text-center">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 bg-[#050805] border-2 border-[#1a2e1a] flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-[#6b8e6b]" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#050805] border border-[#60a5fa]/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#60a5fa]" />
          </div>
        </div>

        <h3 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          NO ORDERS YET
        </h3>

        <p className="text-[#6b8e6b] font-mono text-sm max-w-lg mx-auto mb-3">
          Your orders will appear here after you make a purchase. Browse our collection 
          of artist-designed merchandise, from limited edition garments to exclusive drops.
        </p>

        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-10">
          Every purchase supports tattoo artists and their partners. Wear the art, 
          support the culture.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#60a5fa]/10 border border-[#60a5fa]/30 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-[#60a5fa]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">DISCOVER</p>
            <p className="text-xs text-[#6b8e6b]">
              Browse designs from verified tattoo artists worldwide
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center mb-3">
              <Gift className="h-5 w-5 text-[#fbbf24]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">EXCLUSIVE DROPS</p>
            <p className="text-xs text-[#6b8e6b]">
              Limited edition garments with artist attributions
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-[#4ade80]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">SUPPORT</p>
            <p className="text-xs text-[#6b8e6b]">
              Every purchase supports artists and their partners
            </p>
          </div>
        </div>

        <Link href="/shop">
          <Button
            size="lg"
            className="bg-[#60a5fa] hover:bg-[#3b82f6] text-black rounded-none font-black tracking-wider px-8"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            START SHOPPING
          </Button>
        </Link>

        <p className="mt-6 text-xs text-[#6b8e6b] font-mono">
          Free shipping on orders over $75 • Authentic artist merchandise
        </p>
      </CardContent>
    </Card>
  )
}
