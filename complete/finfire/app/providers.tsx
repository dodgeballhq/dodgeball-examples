"use client";

import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clientEnv, sharedEnv } from "@/lib/environment";
import { DodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { SessionProvider } from "@/lib/providers/session-provider";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DodgeballProvider
      publicApiKey={clientEnv.dodgeball.publicApiKey}
      dodgeballApiUrl={sharedEnv.dodgeball.apiUrl}>
      <SessionProvider>
        <TooltipProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </TooltipProvider>
      </SessionProvider>
    </DodgeballProvider>
  );
}
