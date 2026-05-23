"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getShopItems, getProductDesignsByArtist } from "@/lib/api/products"
import { getDesigns, getDesignsByArtist, createDesign, deleteDesign, type CreateDesignInput } from "@/lib/api/designs"
import { getArtists, getArtistById, updateProfile, type UpdateProfileInput } from "@/lib/api/artists"

// Products/Shop
export function useShopItems() {
  return useQuery({
    queryKey: ["shop", "items"],
    queryFn: getShopItems,
  })
}

export function useArtistProductDesigns(artistId: string) {
  return useQuery({
    queryKey: ["products", "artist", artistId],
    queryFn: () => getProductDesignsByArtist(artistId),
    enabled: !!artistId,
  })
}

// Designs
export function useDesigns() {
  return useQuery({
    queryKey: ["designs"],
    queryFn: getDesigns,
  })
}

export function useArtistDesigns(artistId: string) {
  return useQuery({
    queryKey: ["designs", "artist", artistId],
    queryFn: () => getDesignsByArtist(artistId),
    enabled: !!artistId,
  })
}

export function useCreateDesign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] })
    },
  })
}

export function useDeleteDesign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] })
    },
  })
}

// Artists
export function useArtists() {
  return useQuery({
    queryKey: ["artists"],
    queryFn: getArtists,
  })
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ["artists", id],
    queryFn: () => getArtistById(id),
    enabled: !!id,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ input, userId }: { input: UpdateProfileInput; userId: string }) => updateProfile(input, userId),
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["artists", data.id] })
      queryClient.invalidateQueries({ queryKey: ["artists"] })
    },
  })
}
