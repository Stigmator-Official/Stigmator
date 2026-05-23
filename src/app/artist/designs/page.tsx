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
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload,
  ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock designs data
interface Design {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: "draft" | "published" | "archived" | "pending_review";
  category: string;
  tags: string[];
  isNSFW: boolean;
  viewCount: number;
  salesCount: number;
  earnings: number;
  createdAt: string;
  productsCount: number;
}

const MOCK_DESIGNS: Design[] = [
  {
    id: "des_001",
    title: "Traditional Japanese Dragon",
    description: "Bold Japanese dragon with cherry blossoms",
    imageUrl: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop",
    status: "published",
    category: "Japanese",
    tags: ["dragon", "japanese", "traditional", "cherry blossom"],
    isNSFW: false,
    viewCount: 1247,
    salesCount: 23,
    earnings: 1840,
    createdAt: "2025-03-15T10:00:00Z",
    productsCount: 3,
  },
  {
    id: "des_002",
    title: "Geometric Wolf",
    description: "Sacred geometry wolf head with moon phases",
    imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400&h=400&fit=crop",
    status: "published",
    category: "Geometric",
    tags: ["wolf", "geometric", "sacred", "moon"],
    isNSFW: false,
    viewCount: 892,
    salesCount: 15,
    earnings: 1125,
    createdAt: "2025-03-10T14:30:00Z",
    productsCount: 2,
  },
  {
    id: "des_003",
    title: "Watercolor Phoenix",
    description: "Rising phoenix in vibrant watercolor style",
    imageUrl: "https://images.unsplash.com/photo-1590246815117-7e73c35e9c0f?w=400&h=400&fit=crop",
    status: "draft",
    category: "Watercolor",
    tags: ["phoenix", "watercolor", "colorful", "bird"],
    isNSFW: false,
    viewCount: 0,
    salesCount: 0,
    earnings: 0,
    createdAt: "2025-03-22T09:00:00Z",
    productsCount: 0,
  },
  {
    id: "des_004",
    title: "Minimalist Cat",
    description: "Simple line art cat silhouette",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    status: "archived",
    category: "Minimalist",
    tags: ["cat", "minimalist", "line art"],
    isNSFW: false,
    viewCount: 456,
    salesCount: 8,
    earnings: 480,
    createdAt: "2025-02-20T16:00:00Z",
    productsCount: 1,
  },
];

const STATUS_BADGES = {
  draft: { color: "bg-[#6b8e6b]/20 text-[#6b8e6b] border-[#6b8e6b]/30", label: "DRAFT", icon: Clock },
  published: { color: "bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30", label: "PUBLISHED", icon: CheckCircle },
  archived: { color: "bg-[#dc2626]/20 text-[#dc2626] border-[#dc2626]/30", label: "ARCHIVED", icon: EyeOff },
  pending_review: { color: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30", label: "PENDING REVIEW", icon: AlertCircle },
};

export default function DesignsGalleryPage() {
  const { user } = useAuth();
  useRequireRole(["ARTIST", "ADMIN"]);

  const [designs, setDesigns] = useState<Design[]>(MOCK_DESIGNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || design.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: designs.length,
    published: designs.filter(d => d.status === "published").length,
    draft: designs.filter(d => d.status === "draft").length,
    totalEarnings: designs.reduce((sum, d) => sum + d.earnings, 0),
    totalSales: designs.reduce((sum, d) => sum + d.salesCount, 0),
  };

  const handleDelete = (designId: string) => {
    if (confirm("Are you sure you want to delete this design? This action cannot be undone.")) {
      setDesigns(prev => prev.filter(d => d.id !== designId));
    }
  };

  const handleStatusChange = (designId: string, newStatus: Design["status"]) => {
    setDesigns(prev => prev.map(d => d.id === designId ? { ...d, status: newStatus } : d));
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
              YOUR DESIGNS
            </h1>
            <p className="text-[#6b8e6b] mt-1">
              Manage your tattoo design portfolio
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/artist/designs/upload">
              <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                <Plus className="mr-2 h-4 w-4" />
                UPLOAD NEW DESIGN
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-[#e8f5e8]">{stats.total}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL DESIGNS</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-[#4ade80]">{stats.published}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">PUBLISHED</p>
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
              <p className="text-2xl font-black text-[#dc2626]">${stats.totalEarnings}</p>
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
              placeholder="Search designs..."
              className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
            />
          </div>
          <div className="flex gap-2">
            {["all", "published", "draft", "archived"].map(status => (
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

        {/* Designs Grid */}
        {filteredDesigns.length === 0 ? (
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
              <p className="text-[#6b8e6b] font-mono text-lg mb-4">NO DESIGNS FOUND</p>
              <p className="text-sm text-[#6b8e6b]/70 mb-6">
                {searchQuery ? "Try adjusting your search" : "Upload your first design to get started"}
              </p>
              {!searchQuery && (
                <Link href="/artist/designs/upload">
                  <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                    <Upload className="mr-2 h-4 w-4" />
                    UPLOAD DESIGN
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map(design => {
              const statusBadge = STATUS_BADGES[design.status];
              const StatusIcon = statusBadge.icon;

              return (
                <Card key={design.id} className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-square bg-[#050805]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${statusBadge.color} rounded-none font-mono text-xs flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                    </div>

                    {/* NSFW Badge */}
                    {design.isNSFW && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[#dc2626] text-white rounded-none font-mono text-xs">
                          NSFW
                        </Badge>
                      </div>
                    )}

                    {/* Actions Menu */}
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
                            onClick={() => handleStatusChange(design.id, "published")}
                            disabled={design.status === "published"}
                            className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(design.id, "draft")}
                            disabled={design.status === "draft"}
                            className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Set as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(design.id, "archived")}
                            disabled={design.status === "archived"}
                            className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                          >
                            <EyeOff className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(design.id)}
                            className="text-[#dc2626] hover:bg-[#dc2626]/10 focus:bg-[#dc2626]/10 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-black tracking-tighter text-[#e8f5e8] truncate mb-1">
                      {design.title}
                    </h3>
                    <p className="text-xs text-[#6b8e6b] mb-3 line-clamp-2">
                      {design.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {design.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-[#1a2e1a] text-[#6b8e6b] text-[10px] font-mono uppercase">
                          {tag}
                        </span>
                      ))}
                      {design.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-[#6b8e6b] text-[10px]">
                          +{design.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-[#1a2e1a] pt-3">
                      <div>
                        <p className="text-sm font-black text-[#e8f5e8]">{design.viewCount}</p>
                        <p className="text-[10px] text-[#6b8e6b]">VIEWS</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#4ade80]">{design.salesCount}</p>
                        <p className="text-[10px] text-[#6b8e6b]">SALES</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#dc2626]">${design.earnings}</p>
                        <p className="text-[10px] text-[#6b8e6b]">EARNED</p>
                      </div>
                    </div>

                    {/* Products Count */}
                    {design.productsCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#1a2e1a]">
                        <Link href={`/artist/designs/${design.id}/products`}>
                          <p className="text-xs text-[#4ade80] hover:underline flex items-center justify-center gap-1">
                            {design.productsCount} product{design.productsCount !== 1 ? "s" : ""}
                            <ExternalLink className="h-3 w-3" />
                          </p>
                        </Link>
                      </div>
                    )}
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
