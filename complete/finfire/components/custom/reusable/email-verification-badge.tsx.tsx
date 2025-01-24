"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/lib/providers/session-provider";
import { IdCardIcon } from "lucide-react";

interface EmailVerificationBadgeProps {
  showText?: boolean;
}

export const EmailVerificationBadge: React.FC<EmailVerificationBadgeProps> = ({ showText = true }) => {
  const { sessionUser } = useSession();
  if (!sessionUser) return null;

  const bgColor = sessionUser?.isEmailVerified ? "bg-cyan-200" : "bg-red-200";
  const textColor = sessionUser?.isEmailVerified ? "text-cyan-900" : "text-red-900";
  const text = sessionUser?.isEmailVerified ? "Verified" : "Not Verified";
  const tooltipText = sessionUser?.isEmailVerified ? "Account is email verified" : "Account is not email verified";

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger>
        <div className={`${bgColor} px-2 py-0.5 rounded flex items-center gap-2`}>
          {showText && <p className={`text-sm ${textColor}`}>{text}</p>}
          <IdCardIcon className={`w-5 h-5 ${textColor}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};
