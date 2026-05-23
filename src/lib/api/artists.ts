import { prismaPromise } from "@/lib/db/client"

export type Artist = {
  id: string
  email: string
  fullName: string | null
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  location: string | null
  website: string | null
  instagramHandle: string | null
  isVerified: boolean
  isApproved: boolean
  role: string
  createdAt: Date
  // Aggregated stats
  totalSales: number
  totalDesigns: number
  rating: number
}

export async function getArtists(): Promise<Artist[]> {
  const prisma = await prismaPromise
  
  const users = await prisma.user.findMany({
    where: {
      role: "ARTIST",
      isApproved: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      designs: true,
    },
  })

  return (users as any[]).map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    website: user.website,
    instagramHandle: user.instagramHandle,
    isVerified: user.isVerified,
    isApproved: user.isApproved,
    role: user.role,
    createdAt: user.createdAt,
    totalSales: (user.designs as any[]).reduce((sum, d) => sum + (d.sales || 0), 0),
    totalDesigns: user.designs.length,
    rating: 5.0,
  }))
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const prisma = await prismaPromise
  
  const user = await prisma.user.findFirst({
    where: {
      id,
      role: "ARTIST",
    },
    include: {
      designs: true,
    },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    website: user.website,
    instagramHandle: user.instagramHandle,
    isVerified: user.isVerified,
    isApproved: user.isApproved,
    role: user.role,
    createdAt: user.createdAt,
    totalSales: (user.designs as any[]).reduce((sum, d) => sum + (d.sales || 0), 0),
    totalDesigns: user.designs.length,
    rating: 5.0,
  } as Artist
}

export async function getFeaturedArtists(limit: number = 6): Promise<Artist[]> {
  const prisma = await prismaPromise
  
  const users = await prisma.user.findMany({
    where: {
      role: "ARTIST",
      isApproved: true,
      isVerified: true,
    },
    take: limit,
    include: {
      designs: true,
    },
  })

  return (users as any[]).map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    website: user.website,
    instagramHandle: user.instagramHandle,
    isVerified: user.isVerified,
    isApproved: user.isApproved,
    role: user.role,
    createdAt: user.createdAt,
    totalSales: (user.designs as any[]).reduce((sum, d) => sum + (d.sales || 0), 0),
    totalDesigns: user.designs.length,
    rating: 5.0,
  }))
}

export type UpdateProfileInput = {
  fullName?: string
  displayName?: string
  bio?: string
  location?: string
  website?: string
  instagramHandle?: string
  avatarUrl?: string
}

export async function updateProfile(input: UpdateProfileInput, userId: string): Promise<Artist> {
  const prisma = await prismaPromise
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...input,
    },
    include: {
      designs: true,
    },
  })

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    website: user.website,
    instagramHandle: user.instagramHandle,
    isVerified: user.isVerified,
    isApproved: user.isApproved,
    role: user.role,
    createdAt: user.createdAt,
    totalSales: (user.designs as any[]).reduce((sum, d) => sum + (d.sales || 0), 0),
    totalDesigns: user.designs.length,
    rating: 5.0,
  } as Artist
}
