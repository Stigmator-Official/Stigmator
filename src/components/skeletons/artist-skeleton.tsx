export function ArtistCardSkeleton() {
  return (
    <div className="bg-[#0a0f0a] border border-[#1a2e1a] rounded-none overflow-hidden animate-pulse">
      {/* Cover */}
      <div className="h-32 bg-[#1a2e1a]" />
      
      {/* Avatar & Info */}
      <div className="px-6 pb-6 -mt-12">
        <div className="w-24 h-24 bg-[#1a2e1a] border-4 border-[#0a0f0a] rounded-full mb-4" />
        
        <div className="h-6 bg-[#1a2e1a] rounded w-3/4 mb-2" />
        <div className="h-4 bg-[#1a2e1a] rounded w-1/2 mb-4" />
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="h-16 bg-[#1a2e1a] rounded" />
          <div className="h-16 bg-[#1a2e1a] rounded" />
        </div>
        
        <div className="h-12 bg-[#1a2e1a] rounded" />
      </div>
    </div>
  )
}

export function ArtistGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArtistCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ArtistProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Cover */}
      <div className="h-48 sm:h-64 bg-[#1a2e1a]" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 -mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] rounded-none p-6">
              <div className="w-32 h-32 bg-[#1a2e1a] rounded-full mx-auto -mt-20 mb-4" />
              <div className="h-8 bg-[#1a2e1a] rounded w-2/3 mx-auto mb-2" />
              <div className="h-4 bg-[#1a2e1a] rounded w-1/2 mx-auto mb-6" />
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="h-14 bg-[#1a2e1a] rounded" />
                <div className="h-14 bg-[#1a2e1a] rounded" />
                <div className="h-14 bg-[#1a2e1a] rounded" />
              </div>
              
              <div className="h-12 bg-[#1a2e1a] rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-[#1a2e1a] rounded w-3/4" />
                <div className="h-4 bg-[#1a2e1a] rounded w-1/2" />
                <div className="h-4 bg-[#1a2e1a] rounded w-2/3" />
              </div>
            </div>
          </div>
          
          {/* Right Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="h-8 bg-[#1a2e1a] rounded w-48 mb-4" />
            <div className="grid sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#1a2e1a] rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
