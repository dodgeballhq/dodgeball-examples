"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/lib/providers/session-provider";
import { IdCardIcon } from "lucide-react";

interface PhoneVerificationBadgeProps {
  showText?: boolean;
}

export const PhoneVerificationBadge: React.FC<PhoneVerificationBadgeProps> = ({ showText = true }) => {
  const { sessionUser } = useSession();
  if (!sessionUser) return null;

  const bgColor = sessionUser?.isPhoneVerified ? "bg-cyan-200" : "bg-red-200";
  const textColor = sessionUser?.isPhoneVerified ? "text-cyan-900" : "text-red-900";
  const text = sessionUser?.isPhoneVerified ? "Verified" : "Not Verified";
  const tooltipText = sessionUser?.isPhoneVerified ? "Account is phone verified" : "Account is not phone verified";

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
