"use client";

import { MessageCircle, Search } from "lucide-react";
import { Button, Input, Spinner } from "@/shared/ui";
import { UserCard } from "@/entities/user";
import { useSearch } from "@/shared/hooks/useSearch";
import { searchUsersAction } from "@/features/user-search";
import type { User } from "@/entities/user";

interface UserSearchWidgetProps {
  emptyFallback?: React.ReactNode;
  title?: string;
}

export function UserSearchWidget({ emptyFallback, title }: UserSearchWidgetProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    isLoadingMore,
    hasMore,
    observerRef,
  } = useSearch<User>({
    searchAction: searchUsersAction,
    pageSize: 10,
  });

  return (
    <div className="flex flex-col gap-6 pb-12 pt-2">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-8 hidden md:block">
            {title}
          </h1>
        </div>
      )}

      <div className="px-2">
        <Input
          placeholder="Введите имя или @username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={18} />}
          className="bg-surface/50 border-border/40 backdrop-blur-md h-14 rounded-2xl text-lg"
          autoFocus
        />
      </div>

      <div className="px-2">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size={32} />
          </div>
        ) : query.trim().length >= 2 && results.length > 0 ? (
          <div className="grid gap-3">
            {results.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                renderActions={
                  <Button variant="secondary" size="sm" onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("search:start_chat", { detail: { userId: user.id } }));
                  }}>
                    <MessageCircle size={16} />
                  </Button>
                }
              />
            ))}

            {hasMore && (
              <div ref={observerRef} className="flex justify-center p-4">
                {isLoadingMore && <Spinner size={24} />}
              </div>
            )}
          </div>
        ) : query.trim().length >= 2 && results.length === 0 ? (
          <div className="text-center p-12 text-secondary bg-surface rounded-3xl border border-border/20">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-primary mb-1">Ничего не найдено</p>
            <p>Попробуйте изменить запрос</p>
          </div>
        ) : (
          <>{emptyFallback}</>
        )}
      </div>
    </div>
  );
}
