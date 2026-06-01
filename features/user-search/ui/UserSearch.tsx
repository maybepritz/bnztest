"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Search } from "lucide-react";
import { Input, Avatar } from "@/shared/ui";
import { searchUsersAction } from "../api/searchUsers";
import Link from "next/link";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { ref, inView } = useInView(); 

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const users = await searchUsersAction(query);
          setResults(users);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      <Input 
        placeholder="Найти пользователя..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.trim().length >= 2) setIsOpen(true); }}
        leftIcon={<Search size={18} />}
        className="bg-surface/50 border-border/40 backdrop-blur-md h-12 py-0"
      />
      
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-elevated overflow-hidden z-50 animate-fade-in">
          {isLoading ? (
            <div className="p-4 text-center text-secondary text-sm">Поиск...</div>
          ) : results.length > 0 ? (
            <div className="max-h-64 overflow-y-auto divide-y divide-border/10">
              {results.map(user => (
                <Link 
                  key={user.id} 
                  href={`/messages/${user.username || user.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Avatar size="md" fallback={user.email?.[0].toUpperCase()} />
                  <div className="flex-1 min-w-0">
                    <div className="text-primary font-medium text-[15px] truncate">{user.name || user.username}</div>
                    <div className="text-secondary text-xs truncate">@{user.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-secondary text-sm">Пользователи не найдены</div>
          )}
        </div>
      )}
    </div>
  );
}
