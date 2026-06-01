import { FriendsList } from "@/widgets/friends-list/ui/FriendsList";
import { UserSearchWidget } from "@/widgets/UserSearchWidget";
import { MessageSearchWidget } from "@/widgets/MessageSearchWidget";
import { SearchTabsWidget } from "@/widgets/SearchTabsWidget";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поиск | Мессенджер",
};

export default function SearchPage() {
  return (
    <SearchTabsWidget
      userSearchSlot={<UserSearchWidget emptyFallback={<FriendsList />} />}
      messageSearchSlot={<MessageSearchWidget />}
    />
  );
}
