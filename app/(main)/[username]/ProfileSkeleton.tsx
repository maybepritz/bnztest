export function ProfileSkeleton() {
  return (
    <div className="pt-10 transition-colors duration-300 grid gap-6 animate-pulse">
      {/* Banner & Avatar Area */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 w-full bg-surface rounded-b-3xl" />
        
        {/* Avatar */}
        <div className="absolute -bottom-16 left-6 p-1.5 bg-background rounded-[40px]">
          <div className="w-32 h-32 rounded-[32px] bg-surface" />
        </div>
        
        {/* Action Button */}
        <div className="absolute -bottom-14 right-6 w-32 h-10 bg-surface rounded-xl" />
      </div>

      {/* Info Area */}
      <div className="px-6 pt-20 flex flex-col gap-4">
        <div>
          <div className="h-8 w-48 bg-surface rounded-lg mb-2" />
          <div className="h-4 w-32 bg-surface rounded-md" />
        </div>
        
        <div className="h-4 w-3/4 bg-surface rounded-md" />
        <div className="h-4 w-1/2 bg-surface rounded-md" />
        
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-24 bg-surface rounded-md" />
          <div className="h-4 w-24 bg-surface rounded-md" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-2">
        <div className="flex bg-surface p-1.5 rounded-full h-12 w-full" />
      </div>

      {/* Posts Skeleton */}
      <div className="px-6 pb-20 flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-surface rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="w-32 h-4 bg-background rounded-md" />
                <div className="w-20 h-3 bg-background rounded-md" />
              </div>
            </div>
            <div className="w-full h-24 bg-background rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
