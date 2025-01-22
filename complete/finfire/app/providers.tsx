"use client"

import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DodgeballProvider } from "@/lib/providers/dodgeball-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const dodgeballPublicApiKey = process.env.NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY ?? "UNSET_PUBLIC_API_KEY";
  const dodgeballApiUrl = process.env.NEXT_PUBLIC_DODGEBALL_API_URL;
  return (
    <TooltipProvider>
      <ToastProvider>
        <DodgeballProvider publicApiKey={dodgeballPublicApiKey} dodgeballApiUrl={dodgeballApiUrl}>
          {children}
          <Toaster />
        </DodgeballProvider>
      </ToastProvider>
    </TooltipProvider>
  )
}