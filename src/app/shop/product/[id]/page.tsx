"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { getProductDesignById, type ProductDesign } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Droplets,
  Sparkles,
  Loader2
} from "lucide-react";

// Calculate freshness based on sales velocity and age
function calculateFreshness(totalSales: number, createdAt: string): "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE" {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const salesPerDay = totalSales / Math.max(ageDays, 1);
  
  if (salesPerDay > 2) return "FIRE";
  if (salesPerDay > 1) return "HOT";
  if (ageDays < 30) return "FRESH";
  if (ageDays > 90) return "VINTAGE";
  return "STALE";
}

const FRESHNESS_COLORS = {
  FIRE: "bg-[#dc2626] text-white",
  HOT: "bg-[#f97316] text-white",
  FRESH: "bg-[#4ade80] text-black",
  STALE: "bg-[#6b8e6b] text-white",
  VINTAGE: "bg-[#1a2e1a] text-[#6b8e6b]",
};

// Default sizes and colors for products
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const DEFAULT_COLORS = ["Black", "White", "Grey", "Navy", "Olive"];

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductDesign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const data = await getProductDesignById(productId);
        setProduct(data);
        if (data && data.product?.colors && data.product.colors.length > 0) {
          setSelectedColorName(data.product.colors[0].name);
        }
      } catch (err) {
        // Error loading product
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#050805] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#4ade80] animate-spin mx-auto mb-4" />
          <p className="text-[#6b8e6b] font-mono">LOADING PRODUCT...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 text-center">
          <AlertCircle className="h-16 w-16 text-[#dc2626] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#e8f5e8] mb-2">PRODUCT NOT FOUND</h1>
          <p className="text-[#6b8e6b] mb-6">This product doesn&apos;t exist or has been removed.</p>
          <Link href="/shop">
            <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
              BACK TO SHOP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const freshness = calculateFreshness(product.total_sales, product.created_at);
  const images = product.mockup_images?.length > 0 
    ? product.mockup_images 
    : [product.design?.images?.[0] || "/placeholder-product.png"];
  
  const productName = product.product?.name || "Product";
  const designTitle = product.design?.title || "Design";
  const artistName = product.design?.artist?.display_name || "Unknown Artist";
  const artistId = product.design?.artist?.id || "";
  
  // Use product override price or base price
  const price = product.price_override || product.product?.base_price || 4500;
  
  // Get available sizes and colors from product data
  const availableSizes = product.product?.sizes || DEFAULT_SIZES;
  const colorOptions = product.product?.colors || DEFAULT_COLORS.map(name => ({ name, hex: name.toLowerCase() === "black" ? "#0a0a0a" : name.toLowerCase() === "white" ? "#fafafa" : name.toLowerCase() === "grey" ? "#6b7280" : name.toLowerCase() === "navy" ? "#1e3a5f" : name.toLowerCase() === "olive" ? "#4a5d23" : "#6b7280" }));
  
  const [selectedColorName, setSelectedColorName] = useState<string>(colorOptions[0]?.name || "Black");
  const selectedColorHex = colorOptions.find(c => c.name === selectedColorName)?.hex || "#0a0a0a";

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColorName) return;
    
    addItem({
      product_design_id: product.id,
      design_title: designTitle,
      product_name: `${productName} (${selectedColorName})`,
      artist_name: artistName,
      artist_id: artistId,
      mockup_image: images[0],
      size: selectedSize,
      color: selectedColorName,
      quantity: quantity,
      unit_price: Math.round(price),
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#050805]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#6b8e6b] mb-6">
          <Link href="/" className="hover:text-[#e8f5e8]">HOME</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-[#e8f5e8]">FLASH</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#e8f5e8] truncate max-w-[200px]">{productName.toUpperCase()}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] bg-[#0a0f0a] border border-[#1a2e1a] group overflow-hidden">
              <OptimizedImage
                src={images[currentImage]}
                alt={productName}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                transform={{ width: 800, height: 1000, resize: "cover" }}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={`${FRESHNESS_COLORS[freshness]} rounded-none font-black text-xs`}>
                  {freshness === "FIRE" && <Sparkles className="h-3 w-3 mr-1" />}
                  {freshness}
                </Badge>
                {/* Color indicator */}
                <Badge 
                  className="rounded-none font-black text-xs border-0"
                  style={{ backgroundColor: selectedColorHex, color: selectedColorHex === "#fafafa" || selectedColorHex === "#ffffff" ? "#000" : "#fff" }}
                >
                  {selectedColorName.toUpperCase()}
                </Badge>
              </div>
              
              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 bg-[#0a0f0a]/80 px-3 py-1.5 text-[10px] font-mono text-[#6b8e6b] opacity-0 group-hover:opacity-100 transition-opacity">
                HOVER TO ZOOM
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-20 border-2 overflow-hidden transition-all ${
                      currentImage === index ? "border-[#4ade80]" : "border-[#1a2e1a]"
                    }`}
                  >
                    <OptimizedImage
                      src={img}
                      alt=""
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      transform={{ width: 80, height: 80, resize: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <Link href={`/artists/${artistId}`} className="text-[#4ade80] font-mono text-sm hover:underline">
                {artistName}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#e8f5e8] mt-2">
                {productName}
              </h1>
              <p className="text-[#6b8e6b] mt-1">{designTitle} • {product.product?.category?.name}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#4ade80]">${(price / 100).toFixed(2)}</span>
              <span className="text-sm text-[#6b8e6b] ml-2">or 4 payments of ${(price / 400).toFixed(2)}</span>
            </div>

            {/* Partnership Info - Placeholder for Phase 7 */}
            {false && (
              <Card className="bg-[#fbbf24]/10 border-[#fbbf24]/30 rounded-none">
                <CardContent className="p-4 flex items-start gap-3">
                  <Droplets className="h-5 w-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#fbbf24]">EQUITY INK ACTIVE</p>
                    <p className="text-xs text-[#6b8e6b] mt-1">
                      The original tattoo wearer earns 20% from every sale.
                      <Link href="/partner" className="text-[#4ade80] hover:underline ml-1">Learn more</Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <p className="text-[#a3c9a3] leading-relaxed">
              {product.product?.description || `Premium quality ${productName} featuring authentic tattoo art by ${artistName}.`}
            </p>

            <Separator className="bg-[#1a2e1a]" />

            {/* Color Selection */}
            <div>
              <label className="text-[#e8f5e8] font-mono text-xs tracking-wider mb-3 block">
                COLOR: <span className="text-[#4ade80]">{selectedColorName.toUpperCase()}</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorName(color.name)}
                    className={`w-12 h-12 border-2 transition-all ${
                      selectedColorName === color.name ? "border-[#4ade80] scale-110" : "border-[#1a2e1a]"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColorName === color.name && (
                      <CheckCircle className="h-5 w-5 text-[#4ade80] mx-auto drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  SIZE: <span className="text-[#4ade80]">{selectedSize}</span>
                </label>
                <button className="text-xs text-[#6b8e6b] hover:text-[#4ade80] underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 font-black text-sm transition-all ${
                      selectedSize === size
                        ? "bg-[#4ade80] text-black"
                        : "bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] hover:border-[#4ade80]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-[#e8f5e8] font-mono text-xs tracking-wider mb-3 block">QUANTITY</label>
              <div className="flex items-center gap-0 w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] hover:bg-[#1a2e1a] flex items-center justify-center"
                >
                  -
                </button>
                <div className="flex-1 h-10 bg-[#050805] border-y border-[#1a2e1a] flex items-center justify-center text-[#e8f5e8] font-bold">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] hover:bg-[#1a2e1a] flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`flex-1 h-14 rounded-none font-black tracking-wider transition-all ${
                  addedToCart ? "bg-[#4ade80] text-black" : "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                }`}
              >
                {addedToCart ? (
                  <><CheckCircle className="mr-2 h-5 w-5" />ADDED TO BAG</>
                ) : (
                  <><ShoppingCart className="mr-2 h-5 w-5" />ADD TO BAG — ${((price * quantity) / 100).toFixed(2)}</>
                )}
              </Button>
              <Button variant="outline" className="w-14 h-14 border-[#1a2e1a] text-[#6b8e6b] hover:text-[#dc2626] rounded-none">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1a2e1a]">
              <div className="text-center">
                <Truck className="h-5 w-5 text-[#4ade80] mx-auto mb-1" />
                <p className="text-xs text-[#6b8e6b]">Free Shipping over $75</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 text-[#4ade80] mx-auto mb-1" />
                <p className="text-xs text-[#6b8e6b]">Authentic Art</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 text-[#4ade80] mx-auto mb-1" />
                <p className="text-xs text-[#6b8e6b]">30-Day Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
