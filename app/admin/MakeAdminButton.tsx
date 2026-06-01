"use client";

import { Button } from "@/shared/ui";
import { useState } from "react";
import { makeMeAdminAction } from "./actions";

export function MakeAdminButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleMakeAdmin = async () => {
    setIsLoading(true);
    try {
      const res = await makeMeAdminAction();
      if (res.success) {
        alert("Success! You are now an ADMIN. Please LOGOUT and LOGIN again to update your session.");
      } else {
        alert(res.error || "Failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleMakeAdmin} 
      disabled={isLoading}
      className="bg-danger hover:bg-danger/90 text-white border-none"
    >
      {isLoading ? "Wait..." : "Give me ADMIN"}
    </Button>
  );
}
