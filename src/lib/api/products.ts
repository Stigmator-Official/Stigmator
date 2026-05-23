import { supabaseBrowser } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  images: string[]
  sizes: string[]
  colors: { name: string; hex: string }[]
  category: {
    id: string
    name: string
    slug: string
  }
}

export type ProductDesign = {
  id: string
  design_id: string
  product_id: string
  artist_id: string
  mockup_images: string[]
  design_placement: {
    area: string
    x: number
    y: number
    scale: number
    rotation: number
  }
  price_override: number | null
  deposit_amount: number
  is_active: boolean
  total_sales: number
  created_at: string
  design: {
    title: string
    images: string[]
    artist: {
      id: string
      display_name: string
      avatar_url: string | null
    }
  }
  product: Product
}

export async function getProducts(): Promise<Product[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:category_id(id, name, slug)
    `)
    .eq("is_active", true)
    .order("name")

  if (error) {
    logger.error("Error fetching products:", error)
    throw error
  }

  return data || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:category_id(id, name, slug)
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("Error fetching product:", error)
    throw error
  }

  return data
}

export async function getShopItems(): Promise<ProductDesign[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("product_designs")
    .select(`
      *,
      design:design_id(
        title,
        images,
        artist:artist_id(id, display_name, avatar_url)
      ),
      product:product_id(*, category:category_id(id, name, slug))
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    logger.error("Error fetching shop items:", error)
    throw error
  }

  return data || []
}

export async function getProductDesignById(id: string): Promise<ProductDesign | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("product_designs")
    .select(`
      *,
      design:design_id(
        title,
        images,
        artist:artist_id(id, display_name, avatar_url)
      ),
      product:product_id(*, category:category_id(id, name, slug))
    `)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("Error fetching product design:", error)
    throw error
  }

  return data
}

export async function getProductDesignsByArtist(artistId: string): Promise<ProductDesign[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("product_designs")
    .select(`
      *,
      design:design_id(title, images),
      product:product_id(*, category:category_id(id, name, slug))
    `)
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })

  if (error) {
    logger.error("Error fetching artist product designs:", error)
    throw error
  }

  return data || []
}
