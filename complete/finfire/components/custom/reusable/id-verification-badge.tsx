"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/lib/providers/session-provider";
import { IdCardIcon } from "lucide-react";

interface IdVerificationBadgeProps {
  showText?: boolean;
}

export const IdVerificationBadge: React.FC<IdVerificationBadgeProps> = ({ showText = true }) => {
  const { sessionUser } = useSession();
  if (!sessionUser) return null;

  const bgColor = sessionUser?.isIdVerified ? "bg-cyan-200" : "bg-red-200";
  const textColor = sessionUser?.isIdVerified ? "text-cyan-900" : "text-red-900";
  const text = sessionUser?.isIdVerified ? "Verified" : "Not Verified";
  const tooltipText = sessionUser?.isIdVerified ? "Account is ID verified" : "Account is not ID verified";

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
