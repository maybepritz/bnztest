"use client";

import Link from "next/link";

import { Search, Bell, User, LogOut, MessageCircle } from "lucide-react";

import { IconButton } from "@/shared/ui";
import { SidebarItem } from "./SidebarItem";
import { useSidebar } from "../model/useSidebar";



export function Sidebar({ initialUsername }: { initialUsername?: string }) {
  const { pathname, profileHref, unreadCount, messagesUnreadCount, handleLogout } = useSidebar(initialUsername);

  return (
    <aside className="sticky top-0 h-screen w-full grid grid-rows-[auto_1fr_auto] gap-12 py-12 pb-8 z-40 justify-items-center">
      {/* Logo */}
      <div>
        <Link
          href="/"
          className="font-black text-xl tracking-tighter text-primary uppercase"
        >
          БНЗ
        </Link>
      </div>

      {/* Navigation */}
      <nav className="self-start flex flex-col items-center gap-6 bg-surface rounded-full py-10 px-6 shadow-elevated border border-border hover:border-border/30 w-full max-w-20 transition-all duration-300">
        <SidebarItem href="/" icon={MessageCircle} isActive={pathname === "/"} badgeCount={messagesUnreadCount} />
        <SidebarItem href="/search" icon={Search} isActive={pathname === "/search"} noFill />
        <SidebarItem href="/notifications" icon={Bell} isActive={pathname === "/notifications"} badgeCount={unreadCount} />
        <SidebarItem href={profileHref} icon={User} isActive={pathname === profileHref} />
      </nav>

      {/* Logout */}
      <div className="rounded-full transition-all duration-300 self-end">
        <IconButton
          variant="ghost"
          size="lg"
          onClick={handleLogout}
          className="group hover:bg-surface"
          title="Выйти"
        >
          <LogOut size={22} className="stroke-secondary group-hover:stroke-danger transition-colors" strokeWidth={2} />
        </IconButton>
      </div>
    </aside>
  );
}
