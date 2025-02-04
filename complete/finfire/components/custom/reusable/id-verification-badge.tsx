"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/lib/api/users/use-user";
import { IdCardIcon } from "lucide-react";

interface IdVerificationBadgeProps {
  showText?: boolean;
}

export const IdVerificationBadge: React.FC<IdVerificationBadgeProps> = ({ showText = true }) => {
  const { data: userData } = useUser();
  if (!userData?.user) return null;

  const bgColor = userData?.user?.isIdVerified ? "bg-cyan-200" : "bg-red-200";
  const textColor = userData?.user?.isIdVerified ? "text-cyan-900" : "text-red-900";
  const text = userData?.user?.isIdVerified ? "Verified" : "Not Verified";
  const tooltipText = userData?.user?.isIdVerified ? "Account is ID verified" : "Account is not ID verified";

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
