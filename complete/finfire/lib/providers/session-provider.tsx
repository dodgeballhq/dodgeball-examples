"use client";

import { getRefreshedAuthToken, Session, verifyAndDecodeToken } from "@/auth";
import { getIsPublicRoute, NavigationRoutes } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { UserResponse } from "../api/users/types";

interface SessionContextType {
  session: Session | null;
  sessionUser: UserResponse | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refreshSession: (token?: string) => Promise<void>;
  clearSession: (() => void) | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleUnauthenticated = () => {
    localStorage.removeItem("authToken");
    setSessionState((prev) => ({
      ...prev,
      session: null,
      sessionUser: null,
      status: "unauthenticated",
    }));
  };

  const handleClearSession = () => {
    if (sessionState.status === "unauthenticated") return;
    localStorage.removeItem("authToken");
    setSessionState((prev) => ({
      ...prev,
      session: null,
      sessionUser: null,
      status: "unauthenticated",
    }));
  };

  const [sessionState, setSessionState] = useState<SessionContextType>({
    session: null,
    sessionUser: null,
    status: "loading",
    refreshSession: async (token?: string) => await loadSession(token),
    clearSession: handleClearSession,
  });

  const loadSession = async (newToken?: string) => {
    try {
      const token = newToken || localStorage.getItem("authToken");
      if (!token) {
        handleUnauthenticated();
        return;
      }

      const refreshedToken = await getRefreshedAuthToken(token);
      if (!refreshedToken) {
        handleUnauthenticated();
        return;
      }

      localStorage.setItem("authToken", refreshedToken);

      const session = await verifyAndDecodeToken(refreshedToken);
      if (!session) {
        handleUnauthenticated();
        return;
      }

      setSessionState((prev) => ({
        ...prev,
        session,
        sessionUser: session.user,
        status: "authenticated",
      }));
    } catch (error) {
      console.error("Error loading session:", error);
      handleUnauthenticated();
    }
  };

  useEffect(() => {
    loadSession();
    const refreshInterval = setInterval(() => loadSession(), 45 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Add an effect to handle authentication status changes
  useEffect(() => {
    if (sessionState.status === "unauthenticated") {
      const currentPath = window.location.pathname;
      const isPublicRoute = getIsPublicRoute(currentPath);
      if (!isPublicRoute) {
        router.push(NavigationRoutes.LOGOUT);
      }
    }
  }, [sessionState.status, router]);

  return <SessionContext.Provider value={sessionState}>{children}</SessionContext.Provider>;
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
