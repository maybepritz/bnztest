"use client";

import { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  domain: string;
  siteName?: string | null;
}

export function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(result => {
        if (isMounted && !result.error) {
          setData(result);
        } else if (isMounted) {
          // Provide basic fallback
          setData({ url, domain: new URL(url).hostname, title: url, description: null, image: null });
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setData({ url, domain: new URL(url).hostname, title: url, description: null, image: null });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [url]);

  if (loading) return null;
  if (!data) return null; // Fallback to normal link behavior if no rich metadata

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-2 block border-l-[3px] border-current/30 pl-3 py-1 transition-opacity hover:opacity-80 group no-underline max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-bold opacity-90">
          {data.siteName || data.domain}
        </div>
        
        {data.title && (
          <div className="text-sm font-semibold line-clamp-2 group-hover:underline">
            {data.title}
          </div>
        )}
        
        {data.description && (
          <div className="text-[13px] opacity-75 line-clamp-2 leading-snug">
            {data.description}
          </div>
        )}
        
        {data.image && (
          <div className="mt-1.5 rounded-xl overflow-hidden max-h-48 bg-black/10">
            <img 
              src={data.image} 
              alt={data.title || "Link preview"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>
    </a>
  );
}
