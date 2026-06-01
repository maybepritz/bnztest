"use client";

import { ReactNode } from "react";
import { Tabs } from "@/shared/ui/Tabs";

interface SearchTabsWidgetProps {
  userSearchSlot: ReactNode;
  messageSearchSlot: ReactNode;
}

export function SearchTabsWidget({ userSearchSlot, messageSearchSlot }: SearchTabsWidgetProps) {
  return (
    <div className="flex flex-col gap-6 pb-12 pt-2">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-4 hidden md:block text-primary">
          Поиск
        </h1>
      </div>

      <Tabs
        defaultValue="users"
        tabs={[
          {
            value: "users",
            label: "Люди",
            content: userSearchSlot,
          },
          {
            value: "messages",
            label: "Сообщения",
            content: messageSearchSlot,
          },
        ]}
      />
    </div>
  );
}
