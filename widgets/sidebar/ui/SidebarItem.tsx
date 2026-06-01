import Link from "next/link";
import { ElementType } from "react";


interface SidebarItemProps {
  href: string;
  icon: ElementType;
  isActive: boolean;
  noFill?: boolean;
  badgeCount?: number;
}

export function SidebarItem({ href, icon: Icon, isActive, noFill, badgeCount }: SidebarItemProps) {
  return (
    <Link href={href} className="group transition-transform hover:scale-110 p-2 relative">
      <Icon 
        size={22} 
        strokeWidth={isActive || noFill ? 2 : 1.5}
        className={`transition-all duration-300 ${
          isActive 
            ? `stroke-primary ${noFill ? 'fill-transparent' : 'fill-primary'}`
            : `stroke-secondary group-hover:stroke-primary ${noFill ? 'fill-transparent' : 'fill-secondary group-hover:fill-primary'}`
        }`} 
      />
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 bg-accent text-white text-[11px] font-bold flex items-center justify-center rounded-full border-[2.5px] border-surface px-1.5 shadow-sm leading-none z-10 pointer-events-none tabular-nums">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </Link>
  );
}