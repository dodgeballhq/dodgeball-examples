"use client"

import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DodgeballProvider } from "@/lib/providers/dodgeball-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </TooltipProvider>
  )
}