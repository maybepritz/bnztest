import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface UseSearchOptions<T> {
  searchAction: (query: string, page: number) => Promise<T[] | null>;
  pageSize?: number;
  debounceMs?: number; // 300 по умолчанию
}

export function useSearch<T>({ 
  searchAction, 
  pageSize = 10, 
  debounceMs = 300 
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { ref: observerRef, inView } = useInView();

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        setPage(0);
        try {
          const data = await searchAction(query, 0);
          setResults(data || []);
          setHasMore((data || []).length === pageSize);
        } catch (e) {
          console.error(e);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setHasMore(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, searchAction, pageSize, debounceMs]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      const loadMore = async () => {
        setIsLoadingMore(true);
        try {
          const nextPage = page + 1;
          const newData = await searchAction(query, nextPage);

          if (newData && newData.length > 0) {
            setResults(prev => {
              return [...prev, ...newData];
            });
            setPage(nextPage);
            setHasMore(newData.length === pageSize);
          } else {
            setHasMore(false);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingMore(false);
        }
      };
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, page, query, searchAction, pageSize]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isLoadingMore,
    hasMore,
    observerRef,
    setResults,
  };
}
