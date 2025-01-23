"use client";

import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clientEnv, sharedEnv } from "@/lib/environment";
import { DodgeballProvider } from "@/lib/providers/dodgeball-provider";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        <DodgeballProvider publicApiKey={clientEnv.dodgeball.publicApiKey} dodgeballApiUrl={sharedEnv.dodgeball.apiUrl}>
          {children}
          <Toaster />
        </DodgeballProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}
