"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useRequireRole } from "@/lib/auth/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Package,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Shirt
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock products data
interface Product {
  id: string;
  name: string;
  garmentType: string;
  color: string;
  designTitle: string;
  imageUrl: string;
  status: "active" | "paused" | "draft" | "sold_out";
  price: number;
  salesCount: number;
  earnings: number;
  viewCount: number;
  createdAt: string;
  isLimited: boolean;
  limitedQuantity?: number;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    name: "Dragon Fire Hoodie",
    garmentType: "Hoodie",
    color: "Black",
    designTitle: "Japanese Dragon",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop",
    status: "active",
    price: 6500,
    salesCount: 23,
    earnings: 1058,
    viewCount: 1247,
    createdAt: "2025-03-15T10:00:00Z",
    isLimited: false,
  },
  {
    id: "prod_002",
    name: "Geometric Wolf Tee",
    garmentType: "T-Shirt",
    color: "White",
    designTitle: "Geometric Wolf",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
    status: "active",
    price: 4500,
    salesCount: 15,
    earnings: 487,
    viewCount: 892,
    createdAt: "2025-03-10T14:30:00Z",
    isLimited: true,
    limitedQuantity: 100,
  },
  {
    id: "prod_003",
    name: "Phoenix Rising Long Sleeve",
    garmentType: "Long Sleeve",
    color: "Navy",
    designTitle: "Watercolor Phoenix",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop",
    status: "paused",
    price: 5200,
    salesCount: 8,
    earnings: 312,
    viewCount: 456,
    createdAt: "2025-03-05T09:00:00Z",
    isLimited: false,
  },
  {
    id: "prod_004",
    name: "Minimalist Cat Tank",
    garmentType: "Tank Top",
    color: "Grey",
    designTitle: "Minimalist Cat",
    imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=500&fit=crop",
    status: "sold_out",
    price: 3800,
    salesCount: 50,
    earnings: 875,
    viewCount: 1203,
    createdAt: "2025-02-20T16:00:00Z",
    isLimited: true,
    limitedQuantity: 50,
  },
];

const STATUS_BADGES = {
  active: { color: "bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30", label: "ACTIVE" },
  paused: { color: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30", label: "PAUSED" },
  draft: { color: "bg-[#6b8e6b]/20 text-[#6b8e6b] border-[#6b8e6b]/30", label: "DRAFT" },
  sold_out: { color: "bg-[#dc2626]/20 text-[#dc2626] border-[#dc2626]/30", label: "SOLD OUT" },
};

export default function ProductsGalleryPage() {
  const { user } = useAuth();
  useRequireRole(["ARTIST", "ADMIN"]);

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.designTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    totalSales: products.reduce((sum, p) => sum + p.salesCount, 0),
    totalEarnings: products.reduce((sum, p) => sum + p.earnings, 0),
  };

  const handleStatusChange = (productId: string, newStatus: Product["status"]) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Link 
              href="/artist/dashboard" 
              className="inline-flex items-center text-[#6b8e6b] hover:text-[#e8f5e8] mb-2 font-mono text-xs"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK TO DASHBOARD
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#e8f5e8]">
              YOUR PRODUCTS
            </h1>
            <p className="text-[#6b8e6b] mt-1">
              Manage your merchandise catalog
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/artist/garments/create">
              <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black">
                <Plus className="mr-2 h-4 w-4" />
                CREATE PRODUCT
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-[#e8f5e8]">{stats.total}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL PRODUCTS</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-[#4ade80]">{stats.active}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">ACTIVE</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-[#fbbf24]">{stats.totalSales}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL SALES</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-[#4ade80]">${stats.totalEarnings}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL EARNINGS</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "paused", "sold_out"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${
                  statusFilter === status
                    ? "bg-[#4ade80] text-black"
                    : "bg-[#0a0f0a] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
              <p className="text-[#6b8e6b] font-mono text-lg mb-4">NO PRODUCTS FOUND</p>
              <p className="text-sm text-[#6b8e6b]/70 mb-6">
                {searchQuery ? "Try adjusting your search" : "Create your first product to get started"}
              </p>
              {!searchQuery && (
                <Link href="/artist/garments/create">
                  <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black">
                    <Plus className="mr-2 h-4 w-4" />
                    CREATE PRODUCT
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const statusBadge = STATUS_BADGES[product.status];

              return (
                <Card key={product.id} className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-[4/5] bg-[#050805]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${statusBadge.color} rounded-none font-mono text-xs`}>
                        {statusBadge.label}
                      </Badge>
                    </div>

                    {/* Limited Badge */}
                    {product.isLimited && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[#fbbf24] text-black rounded-none font-mono text-xs">
                          LIMITED
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="icon" 
                            className="w-8 h-8 bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(product.id, "active")}
                            disabled={product.status === "active"}
                            className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(product.id, "paused")}
                            disabled={product.status === "paused"}
                            className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                          >
                            <EyeOff className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-black tracking-tighter text-[#e8f5e8] truncate mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#6b8e6b] mb-2">
                      {product.garmentType} • {product.color}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-black text-[#4ade80]">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      {product.isLimited && product.limitedQuantity && (
                        <span className="text-xs text-[#fbbf24]">
                          {product.limitedQuantity} left
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-[#1a2e1a] pt-3">
                      <div>
                        <p className="text-sm font-black text-[#e8f5e8]">{product.viewCount}</p>
                        <p className="text-[10px] text-[#6b8e6b]">VIEWS</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#4ade80]">{product.salesCount}</p>
                        <p className="text-[10px] text-[#6b8e6b]">SALES</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#dc2626]">${product.earnings}</p>
                        <p className="text-[10px] text-[#6b8e6b]">EARNED</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
