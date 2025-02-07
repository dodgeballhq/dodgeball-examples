"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UpdateUserRequest } from "@/lib/api/users/types";
import { useUser } from "@/lib/api/users/use-user";
import { processDodgeballVerification } from "@/lib/dodgeball-extensions/client-helpers";
import { IProcessClientVerification } from "@/lib/dodgeball-extensions/client-types";
import { sharedEnv } from "@/lib/environment";
import { useDodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { IVerification, IVerificationError } from "@dodgeball/trust-sdk-client/dist/types/types";
import { useState } from "react";

interface IdVerificationButtonProps {
  updateUser: (userId: string, user: UpdateUserRequest) => Promise<any>;
}

export const IdVerificationButton: React.FC<IdVerificationButtonProps> = ({ updateUser }) => {
  // Dodgeball State
  const [isVerifying, setIsVerifying] = useState(false);
  const { dodgeball, sourceToken } = useDodgeballProvider();
  const { data: userData, refetch: refetchUser, isLoading: isLoadingUser } = useUser();
  const userId = userData?.user?.id;
  if (!userData || !userId) return null;

  const handleVerifyId = async () => {
    setIsVerifying(true);
    const onApproved = async (verification: IVerification) => {
      console.log("Checkpoint approved", verification);
      await updateUser(userId, { isIdVerified: true });
      toast({
        title: "Success",
        description: "Your ID has been verified successfully",
        duration: 3000,
      });
      await refetchUser();
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
        clientVerification: {
          checkpointName: "VERIFY_ID",
          sourceToken,
          sessionId: userData?.session?.id,
          userId: userData?.user?.id,
          payload: {
            sessionUser: userData,
            customer: {
              firstName: userData.user?.firstName,
              lastName: userData.user?.lastName,
              primaryEmail: userData.user?.email,
              primaryPhone: userData.user?.phone ?? null,
            },
          },
        },
        callbacks: {
          onApproved,
          onDenied,
          onError,
        },
      };
      await processDodgeballVerification(params);
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
    if (!userData) return;

    try {
      await updateUser(userId, { isIdVerified: false });
      toast({
        title: "Success",
        description: "Your verification has been reset",
        duration: 3000,
      });
      await refetchUser();
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

  if (!userData) return null;

  if (!userData.user?.isIdVerified) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="default" size="sm" onClick={handleVerifyId} disabled={isVerifying || isLoadingUser}>
          Verify your Identity
        </Button>
        <div className="text-sm text-gray-500">This will help us know you are a real person</div>
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
