"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/lib/api/users/use-user";
import { IdCardIcon } from "lucide-react";

interface EmailVerificationBadgeProps {
  showText?: boolean;
}

export const EmailVerificationBadge: React.FC<EmailVerificationBadgeProps> = ({ showText = true }) => {
  const { data: userData } = useUser();
  if (!userData?.user) return null;

  const bgColor = userData?.user?.isEmailVerified ? "bg-cyan-200" : "bg-red-200";
  const textColor = userData?.user?.isEmailVerified ? "text-cyan-900" : "text-red-900";
  const text = userData?.user?.isEmailVerified ? "Verified" : "Not Verified";
  const tooltipText = userData?.user?.isEmailVerified ? "Account is email verified" : "Account is not email verified";

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
