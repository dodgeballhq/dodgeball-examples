"use client";

import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";
import { IDodgeballConfig } from "@dodgeball/trust-sdk-client/dist/types/types";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useUser } from "../api/users/use-user";

interface DodgeballContextState {
  sourceToken: string | null;
  dodgeball: Dodgeball | null;
  isLoading: boolean;
}

const DodgeballContext = createContext<DodgeballContextState | null>(null);

interface DodgeballProviderProps {
  publicApiKey?: string;
  dodgeballApiUrl?: string;
  children: ReactNode;
}

export const DodgeballProvider: React.FC<DodgeballProviderProps> = ({ children, publicApiKey, dodgeballApiUrl }) => {
  const { data: userData } = useUser();
  const [sourceToken, setSourceToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dodgeball, setDodgeball] = useState<Dodgeball | null>(null);

  useEffect(() => {
    const initializeDodgeball = async () => {
      if (!publicApiKey) {
        console.info("Skipping Dodgeball initialization because public API Key is not set");
        setDodgeball(null);
        setSourceToken(null);
        setIsLoading(false);
        return;
      }

      if (!dodgeballApiUrl) {
        console.info("Skipping Dodgeball initialization because API URL is not set");
        setDodgeball(null);
        setSourceToken(null);
        setIsLoading(false);
        return;
      }

      const dodgeballConfig: IDodgeballConfig = {
        apiVersion: DodgeballApiVersion.v1,
        apiUrl: dodgeballApiUrl,
        logLevel: "ERROR" as any,
      };

      try {
        const dodgeballInstance = new Dodgeball(publicApiKey, dodgeballConfig);
        const token = await dodgeballInstance.getSourceToken();
        setDodgeball(dodgeballInstance);
        setSourceToken(token);
      } catch (error) {
        console.error("Error initializing Dodgeball", error);
        setDodgeball(null);
        setSourceToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDodgeball();
  }, [publicApiKey, dodgeballApiUrl]);

  useEffect(() => {
    if (dodgeball && userData?.session?.id && userData?.user?.id) {
      console.log("Running Dodgeball Track for sessionId", userData?.session?.id, "and userId", userData?.user?.id);
      dodgeball.track(userData?.session?.id, userData?.user?.id);
    }
  }, [dodgeball, userData?.session?.id, userData?.user?.id]);

  return (
    <DodgeballContext.Provider value={{ sourceToken, dodgeball, isLoading }}>{children}</DodgeballContext.Provider>
  );
};

export const useDodgeballProvider = () => {
  const context = useContext(DodgeballContext);
  if (!context) {
    throw new Error("useDodgeballProvider must be used within an DodgeballProvider");
  }
  return context;
};
