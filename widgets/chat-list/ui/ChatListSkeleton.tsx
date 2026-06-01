export function ChatListSkeleton() {
  return (
    <div className="flex flex-col animate-pulse pt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50">
          <div className="w-14 h-14 bg-surface rounded-[24px] shrink-0" />
          <div className="flex flex-col gap-2 w-full justify-center">
            <div className="flex justify-between items-center w-full">
              <div className="h-4 w-32 bg-surface rounded-md" />
              <div className="h-3 w-10 bg-surface rounded-md" />
            </div>
            <div className="h-3 w-48 bg-surface rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
