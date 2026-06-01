"use client";
import { useState } from "react";

const EMOJI_CATEGORIES = {
  "Смайлы": ["😀","😂","🥹","😊","😍","🥰","😘","😜","🤪","😎","🤩","🥳","😇","🤔","🫡","🤫","😴","🥺","😢","😭","😤","🤬","💀","👻","🤡"],
  "Жесты": ["👍","👎","👋","🤝","🙏","💪","✌️","🤞","🫶","👏","🫰","🤙","👀","🧠","❤️"],
  "Символы": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❤️‍🔥","✨","🔥","💯","⭐","🌟","⚡","💫","🎉","🎊","🏆","✅","❌","⚠️","💤","🚀"],
};

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [category, setCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  
  return (
    <div className="bg-surface border border-border/50 rounded-2xl shadow-elevated p-3 w-[280px] animate-scale-in">
      <div className="flex gap-1 mb-2 border-b border-border/30 pb-2">
        {Object.keys(EMOJI_CATEGORIES).map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              category === cat ? "bg-primary/10 text-primary font-medium" : "text-secondary hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-0.5 max-h-[200px] overflow-y-auto">
        {EMOJI_CATEGORIES[category as keyof typeof EMOJI_CATEGORIES].map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
