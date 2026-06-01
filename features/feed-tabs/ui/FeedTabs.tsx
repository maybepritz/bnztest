"use client";

import { useState } from "react";
import { clsx } from "clsx";

type FeedMode = "foryou" | "clans" | "following";

export function FeedTabs() {
  const [activeTab, setActiveTab] = useState<FeedMode>("foryou");

  return (
    <div className="flex items-center justify-between bg-surface rounded-full p-1.5 mx-auto w-full mb-2 shadow-sm border border-border/40">
      <button 
        onClick={() => setActiveTab("foryou")}
        className={clsx(
          "flex-1 text-center py-2.5 rounded-full font-medium text-sm transition-colors",
          activeTab === "foryou" 
            ? "bg-hover text-primary" 
            : "text-secondary hover:text-primary hover:bg-surface-hover"
        )}
      >
        Для вас
      </button>
      <button 
        onClick={() => setActiveTab("clans")}
        className={clsx(
          "flex-1 text-center py-2.5 rounded-full font-medium text-sm transition-colors",
          activeTab === "clans" 
            ? "bg-hover text-primary" 
            : "text-secondary hover:text-primary hover:bg-surface-hover"
        )}
      >
        Лента кланов
      </button>
      <button 
        onClick={() => setActiveTab("following")}
        className={clsx(
          "flex-1 text-center py-2.5 rounded-full font-medium text-[15px] transition-colors",
          activeTab === "following" 
            ? "bg-hover text-primary" 
            : "text-secondary hover:text-primary hover:bg-surface-hover"
        )}
      >
        Подписки
      </button>
    </div>
  );
}
