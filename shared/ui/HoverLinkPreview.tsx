"use client";

import { useEffect, useState } from "react";
import { HoverCard } from "./HoverCard";
import { Spinner } from "./Loader";

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  domain: string;
}

export function HoverLinkPreview({ url, children }: { url: string; children: React.ReactNode }) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchPreview = () => {
    if (hasFetched || loading) return;
    setLoading(true);
    
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(result => {
        if (!result.error && (result.title || result.image)) {
          setData(result);
        } else {
          setData({ url, domain: new URL(url).hostname, title: url, description: null, image: null });
        }
      })
      .catch((err) => {
        console.error(err);
        setData({ url, domain: new URL(url).hostname, title: url, description: null, image: null });
      })
      .finally(() => {
        setLoading(false);
        setHasFetched(true);
      });
  };

  const previewContent = (
    <div className="flex flex-col gap-2 pointer-events-none">
      {loading ? (
        <div className="h-40 w-full rounded-xl bg-surface-hover/30 flex items-center justify-center">
          <Spinner size={32} />
        </div>
      ) : data?.image ? (
        <div className="w-full h-40 rounded-xl overflow-hidden shrink-0 bg-surface-hover/30">
          <img 
            src={data.image} 
            alt={data.title || "Preview"} 
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      ) : (
        <div className="h-40 w-full rounded-xl bg-surface-hover/50 flex items-center justify-center text-secondary">
          <span className="text-xs uppercase font-bold tracking-wider">{data?.domain}</span>
        </div>
      )}
      
      <div className="px-1 pb-1 flex flex-col gap-0.5">
        <span className="text-[15px] font-bold text-primary line-clamp-1 leading-snug">
          {data?.title || data?.domain || "Загрузка..."}
        </span>
        <span className="text-[13px] text-secondary font-medium truncate">
          {data?.domain || "..."}
        </span>
      </div>
    </div>
  );

  return (
    <div onMouseEnter={fetchPreview} className="inline-block">
      <HoverCard
        trigger={
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-link hover:underline break-all"
          >
            {children}
          </a>
        }
        side="top"
        className="w-[300px] p-2 bg-surface"
      >
        {previewContent}
      </HoverCard>
    </div>
  );
}
