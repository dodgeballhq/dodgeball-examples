"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UpdateUserRequest } from "@/lib/api/users/types";
import { processDodgeballVerification } from "@/lib/dodgeball-extensions/client-helpers";
import { IProcessClientVerification } from "@/lib/dodgeball-extensions/client-types";
import { sharedEnv } from "@/lib/environment";
import { useDodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { useSession } from "@/lib/providers/session-provider";
import { IVerification, IVerificationError } from "@dodgeball/trust-sdk-client/dist/types/types";
import { useState } from "react";

interface EmailVerificationButtonProps {
  updateUser: (userId: string, user: UpdateUserRequest) => Promise<any>;
}

export const EmailVerificationButton: React.FC<EmailVerificationButtonProps> = ({ updateUser }) => {
  // Dodgeball State
  const [isVerifying, setIsVerifying] = useState(false);
  const { dodgeball } = useDodgeballProvider();
  const { session, sessionUser, refreshSession } = useSession();

  const handleVerify = async () => {
    setIsVerifying(true);
    if (!sessionUser) return;

    const onApproved = async (verification: IVerification) => {
      console.log("Checkpoint approved", verification);
      await updateUser(sessionUser.id, { isEmailVerified: true });
      toast({
        title: "Success",
        description: "Your email has been verified successfully",
        duration: 3000,
      });
      await refreshSession();
      setIsVerifying(false);
    };

    const onDenied = async (verification: IVerification) => {
      console.log("Checkpoint denied", verification);
      toast({
        variant: "destructive",
        title: "Email Verification Unsuccessful",
        description: "Your email was not verified",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    const onError = async (error: IVerificationError) => {
      console.error("Checkpoint error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying your email",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    try {
      const params: IProcessClientVerification = {
        dodgeball,
        internalEndpoint: "api/checkpoint",
        clientVerification: {
          checkpointName: "VERIFY_EMAIL",
          userId: sessionUser.email,
          payload: {
            sessionUser: sessionUser,
            mfa: {
              emailAddresses: sessionUser.email,
            },
            customer: {
              firstName: sessionUser.firstName,
              lastName: sessionUser.lastName,
              primaryEmail: sessionUser.email,
              primaryPhone: sessionUser.phone,
            },
          },
        },
        callbacks: {
          onApproved,
          onDenied,
          onError,
        },
      };
      const checkpointResult = await processDodgeballVerification(params);
      console.log("Checkpoint result", checkpointResult);
    } catch (error) {
      console.error("Error verifying email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying your email",
        duration: 3000,
      });
      setIsVerifying(false);
    }
  };

  const handleResetVerification = async () => {
    if (!sessionUser) return;

    try {
      await updateUser(sessionUser.id, { isEmailVerified: false });
      toast({
        title: "Success",
        description: "Your email verification has been reset",
        duration: 3000,
      });
      await refreshSession();
    } catch (error) {
      console.error("Error resetting email verification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while resetting your email verification",
        duration: 3000,
      });
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-500">Verifying your email...</div>
      </div>
    );
  }

  if (!sessionUser) return null;

  if (!sessionUser.isEmailVerified) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="default" size="sm" onClick={handleVerify} disabled={isVerifying}>
          Verify your Email
        </Button>
        <div className="text-sm text-gray-500">This is important to secure your account</div>
      </div>
    );
  }

  // Demo mode does not allow resetting verification
  if (sharedEnv.flags.isDemoMode) {
    return <div className="text-sm text-gray-500">Email Verification Complete</div>;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleResetVerification}>
      Reset Email Verification
    </Button>
  );
};
