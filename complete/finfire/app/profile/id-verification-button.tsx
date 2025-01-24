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

interface IdVerificationButtonProps {
  updateUser: (userId: string, user: UpdateUserRequest) => Promise<any>;
}

export const IdVerificationButton: React.FC<IdVerificationButtonProps> = ({ updateUser }) => {
  // Dodgeball State
  const [isVerifying, setIsVerifying] = useState(false);
  const { dodgeball } = useDodgeballProvider();
  const { session, sessionUser, refreshSession } = useSession();

  const handleVerifyId = async () => {
    setIsVerifying(true);
    if (!sessionUser) return;

    const onApproved = async (verification: IVerification) => {
      console.log("Checkpoint approved", verification);
      await updateUser(sessionUser.id, { isIdVerified: true });
      toast({
        title: "Success",
        description: "Your ID has been verified successfully",
        duration: 3000,
      });
      await refreshSession();
      setIsVerifying(false);
    };

    const onDenied = async (verification: IVerification) => {
      console.log("Checkpoint denied", verification);
      toast({
        variant: "destructive",
        title: "ID Verification Unsuccessful",
        description: "Your ID was not verified",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    const onError = async (error: IVerificationError) => {
      console.error("Checkpoint error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying your ID",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    try {
      const params: IProcessClientVerification = {
        dodgeball,
        internalEndpoint: "api/checkpoint",
        clientVerification: {
          checkpointName: "VERIFY_ID",
          userId: sessionUser.email,
          payload: {
            sessionUser: sessionUser,
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
      console.error("Error verifying ID:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying your ID",
        duration: 3000,
      });
      setIsVerifying(false);
    }
  };

  const handleResetVerification = async () => {
    if (!sessionUser) return;

    try {
      await updateUser(sessionUser.id, { isIdVerified: false });
      toast({
        title: "Success",
        description: "Your verification has been reset",
        duration: 3000,
      });
      await refreshSession();
    } catch (error) {
      console.error("Error resetting verification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while resetting your verification",
        duration: 3000,
      });
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-500">Verifying your identity...</div>
      </div>
    );
  }

  if (!sessionUser) return null;

  if (!sessionUser.isIdVerified) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="default" size="sm" onClick={handleVerifyId} disabled={isVerifying}>
          Verify your Identity
        </Button>
        <div className="text-sm text-gray-500">This will allow you to make transactions</div>
      </div>
    );
  }

  // Demo mode does not allow resetting verification
  if (sharedEnv.flags.isDemoMode) {
    return <div className="text-sm text-gray-500">ID Verification Complete</div>;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleResetVerification}>
      Reset ID Verification
    </Button>
  );
};
