"use client";

import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/api/queryClient";
import { clientEnv, sharedEnv } from "@/lib/environment";
import { DodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { QueryClientProvider } from "@tanstack/react-query";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DodgeballProvider publicApiKey={clientEnv.dodgeball.publicApiKey} dodgeballApiUrl={sharedEnv.dodgeball.apiUrl}>
        <TooltipProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </TooltipProvider>
      </DodgeballProvider>
    </QueryClientProvider>
  );
}
