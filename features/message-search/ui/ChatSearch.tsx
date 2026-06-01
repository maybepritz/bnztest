"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { IconButton, Spinner } from "@/shared/ui";
import { searchChatMessagesAction } from "../api/searchMessages";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function ChatSearch({ chatId }: { chatId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const msgs = await searchChatMessagesAction(chatId, query);
          const filtered = msgs.filter((msg: any) =>
            msg.content.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 20);
          setResults(filtered);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, chatId]);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMessage = (msgId: string) => {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("msgId", msgId);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (!isOpen && !isPending) {
    return (
      <IconButton variant="ghost" className="rounded-full hover:bg-background/50 transition-colors" onClick={() => setIsOpen(true)}>
        <Search size={18} className="text-secondary" />
      </IconButton>
    );
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Spinner size={48} />
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-border/40">
          <Search size={16} className="text-secondary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-32 md:w-48 text-primary"
          />
          <IconButton variant="ghost" className="w-6 h-6 p-1 rounded-full text-secondary" onClick={() => { setIsOpen(false); setQuery(""); }}>
            <X size={14} />
          </IconButton>
        </div>

        {query.trim().length >= 2 && (
          <div className="absolute top-full right-0 mt-2 w-72 md:w-96 bg-surface border border-white/10 rounded-2xl shadow-elevated overflow-hidden z-50 animate-fade-in">
            {isLoading ? (
              <Spinner size={32} className="m-4 mx-auto" />
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-border/10">
                {results.map(msg => (
                  <div
                    key={msg.id}
                    className="flex justify-between items-start p-4 hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => handleSelectMessage(msg.id)}
                  >
                    <div className="flex flex-col gap-1.5 overflow-hidden pr-4">
                      <span className="font-medium text-white text-base truncate">
                        {msg.sender.name || msg.sender.username}
                      </span>
                      <p className="text-sm text-[#878787] line-clamp-1 break-words">
                        {msg.content}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[13px] text-[#878787] whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-[13px] text-[#878787] whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-secondary text-sm">Ничего не найдено</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
