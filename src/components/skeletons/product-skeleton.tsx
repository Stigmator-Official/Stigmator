export function ProductCardSkeleton() {
  return (
    <div className="bg-[#0a0f0a] border-2 border-[#1a2e1a] rounded-none overflow-hidden animate-pulse">
      {/* Image */}
      <div className="aspect-square bg-[#1a2e1a]" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-6 bg-[#1a2e1a] rounded w-3/4" />
        <div className="h-4 bg-[#1a2e1a] rounded w-1/2" />
        
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-[#1a2e1a] rounded w-20" />
          <div className="h-10 bg-[#1a2e1a] rounded w-28" />
        </div>
      </div>
    </div>
  )
}

export function ProductListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[#0a0f0a] border-2 border-[#1a2e1a] rounded-none animate-pulse">
          <div className="flex">
            <div className="w-48 h-48 bg-[#1a2e1a] flex-shrink-0" />
            <div className="flex-1 p-6 space-y-4">
              <div className="h-6 bg-[#1a2e1a] rounded w-1/3" />
              <div className="h-4 bg-[#1a2e1a] rounded w-1/4" />
              <div className="h-4 bg-[#1a2e1a] rounded w-1/2" />
              <div className="flex justify-end pt-4">
                <div className="h-10 bg-[#1a2e1a] rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ShopHeaderSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      <div className="h-10 bg-[#1a2e1a] rounded w-64 animate-pulse" />
      <div className="h-4 bg-[#1a2e1a] rounded w-96 animate-pulse" />
      
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-[#1a2e1a] rounded w-24 animate-pulse" />
        ))}
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1 h-12 bg-[#1a2e1a] rounded animate-pulse" />
        <div className="h-12 bg-[#1a2e1a] rounded w-32 animate-pulse" />
      </div>
    </div>
  )
}
