"use client";
import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface DodgeballContextState {
  sourceToken: string | null;
  dodgeball: Dodgeball | null;
  isLoading: boolean;
}

const DodgeballContext = createContext<DodgeballContextState | null>(null);

export const useDodgeballContext = () => {
  const context = useContext(DodgeballContext);
  if (context === undefined) {
    throw new Error("useDodgeballContext must be used within a DodgeballProvider");
  }
  return context;
};

interface DodgeballProviderProps {
  publicApiKey?: string;
  dodgeballApiUrl?: string;
  children: ReactNode;
}

export const DodgeballProvider: React.FC<DodgeballProviderProps> = ({ children, publicApiKey, dodgeballApiUrl }) => {
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

      const dodgeballConfig = {
        apiVersion: DodgeballApiVersion.v1,
        apiUrl: dodgeballApiUrl,
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

  return (
    <DodgeballContext.Provider value={{ sourceToken, dodgeball, isLoading }}>{children}</DodgeballContext.Provider>
  );
};

export const useDodgeballProvider = () => {
  const context = useContext(DodgeballContext);
  if (!context) {
    throw new Error("useDodgeballNoSsr must be used within an DodgeballProvider");
  }
  return context;
};
