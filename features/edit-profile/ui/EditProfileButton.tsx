"use client";

import { useState } from "react";
import { Button } from "@/shared/ui";
import { EditProfileModal } from "./EditProfileModal";

interface EditProfileButtonProps {
  user: {
    username?: string | null;
    name?: string | null;
    bio?: string | null;
    
  };
}

export function EditProfileButton({ user }: EditProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" className="rounded-full" onClick={() => setIsOpen(true)}>
        Редактировать
      </Button>
      
      <EditProfileModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        user={user} 
      />
    </>
  );
}
