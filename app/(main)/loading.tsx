import { Spinner } from "@/shared/ui";

export default function MainLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Spinner size={48} />
        <p className="text-secondary text-sm font-medium tracking-widest uppercase animate-pulse">Загрузка...</p>
      </div>
    </div>
  );
}
