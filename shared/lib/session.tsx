"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SessionUser {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  image?: string | null;
  [key: string]: any;
}

export interface SessionContextType {
  data: { user: SessionUser } | null;
  status: "authenticated" | "loading" | "unauthenticated";
}

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession(): SessionContextType {
  return useContext(SessionContext) || { data: null, status: "unauthenticated" };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContextType>({ data: null, status: "loading" });

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setSession({
          data: { 
            user: JSON.parse(userStr)
          },
          status: "authenticated"
        });
      } else {
        setSession({ data: null, status: "unauthenticated" });
      }
    } catch (e) {
      setSession({ data: null, status: "unauthenticated" });
    }
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
