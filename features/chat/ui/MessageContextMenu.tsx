"use client";

import { createPortal } from "react-dom";
import { Reply, Copy, Edit2, Trash2, ChevronDown } from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😢", "🔥"];

interface MessageContextMenuProps {
  contextMenu: { x: number; y: number; transformOrigin: string; msg: any } | null;
  currentUserId: string;
  onClose: () => void;
}

interface ContextMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ContextMenuItem({ icon: Icon, label, onClick, danger }: ContextMenuItemProps) {
  const baseClasses = "px-4 mx-1 text-sm py-2.5 rounded-2xl cursor-pointer flex items-center gap-3 transition-colors group";
  const colorClasses = danger 
    ? "text-danger hover:bg-danger/10" 
    : "text-primary hover:bg-surface-hover";
  const iconClasses = danger
    ? "text-danger"
    : "text-secondary group-hover:text-primary transition-colors";

  return (
    <div className={`${baseClasses} ${colorClasses}`} onClick={onClick}>
      <Icon size={16} className={iconClasses} />
      <span className="font-medium truncate">{label}</span>
    </div>
  );
}

export function MessageContextMenu({ contextMenu, currentUserId, onClose }: MessageContextMenuProps) {
  if (!contextMenu) return null;

  return createPortal(
    <div 
      className="fixed z-99999 flex flex-col gap-2 animate-scale-in"
      style={{ top: contextMenu.y, left: contextMenu.x, transformOrigin: contextMenu.transformOrigin }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="flex items-center px-1.5 py-1.5 bg-surface/70 backdrop-blur-2xl rounded-full shadow-2xl border border-white/5 w-max">
        {EMOJIS.map(emoji => (
          <button 
            key={emoji}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 hover:scale-110 transition-all text-[26px]"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("chat:context_reaction", { detail: { messageId: contextMenu.msg.id, emoji } }));
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-secondary">
          <ChevronDown size={20} />
        </button>
      </div>
      
      <div 
        className="bg-surface/50 backdrop-blur-2xl rounded-2xl py-1 shadow-2xl border border-white/5 w-fit min-w-50 max-w-[320px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ContextMenuItem 
          icon={Reply} 
          label="Ответить" 
          onClick={() => {
            window.dispatchEvent(new CustomEvent("chat:reply", { detail: contextMenu.msg }));
            onClose();
          }} 
        />

        {contextMenu.msg.content && (
          <ContextMenuItem 
            icon={Copy} 
            label="Копировать текст" 
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.msg.content);
              onClose();
            }} 
          />
        )}

        {contextMenu.msg.senderId === currentUserId && (
           <>
             <ContextMenuItem 
               icon={Edit2} 
               label="Изменить" 
               onClick={() => {
                 onClose();
                 window.dispatchEvent(new CustomEvent("chat:edit", { detail: contextMenu.msg }));
               }} 
             />
             
             <div className="h-px bg-white/5 my-1.5" />

             <ContextMenuItem 
               icon={Trash2} 
               label="Удалить" 
               danger 
               onClick={async () => {
                 const msgId = contextMenu.msg.id;
                 onClose();
                 if (window.confirm("Удалить это сообщение?")) {
                   const { deleteMessage } = await import('@/features/chat/actions');
                   await deleteMessage(msgId);
                 }
               }} 
             />
           </>
        )}
      </div>
    </div>,
    document.body
  );
}
