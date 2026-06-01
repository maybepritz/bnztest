"use client";

import { useState } from "react";
import { IconButton } from "@/shared/ui";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { VerifyProfileModal } from "./VerifyProfileModal";

export function VerifyProfileButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <IconButton variant="glass" className="rounded-full px-2.5 py-2.5" onClick={() => setIsOpen(true)}>
                <BadgeCheck
                    className={cn("text-surface w-6 h-6 fill-blue-500 shrink-0")}
                />
            </IconButton>

            <VerifyProfileModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
