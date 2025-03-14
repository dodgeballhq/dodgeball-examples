import { authenticatedFetch } from "../auth";
import { ApiRoutes } from "../navigation";
import { IProcessClientVerification, IVerification, IVerificationError } from "./client-types";
import { IExecuteServerCheckpointRequest, IExecuteServerCheckpointResult } from "./server-types";

/**
 * Handle the verification process for a Dodgeball checkpoint
 * @param clientParams Parameters to handle the verification process from the client
 * @param previousVerificationId Verification ID of the previous verification, if any
 * This is used to handle follow up steps in the verification process
 * For example, if the user has to complete an MFA step, the verification ID
 * will be used to handle the next step in the verification process
 */
export const processDodgeballVerification = async (
  clientParams: IProcessClientVerification,
  previousVerificationId?: string | null | undefined
): Promise<void> => {
  try {
    const { dodgeball, clientVerification, callbacks } = clientParams;
    if (!dodgeball) {
      throw new Error("Dodgeball SDK not initialized");
    }

    const clientIpAddress = await getClientIpAddress();
    const sourceToken = await dodgeball?.getSourceToken();

    // Create the Request to the our call Dodgeball via our Internal API
    const apiParams: IExecuteServerCheckpointRequest = {
      checkpointName: clientVerification.checkpointName,
      payload: clientVerification.payload,
      clientIpAddress: clientIpAddress ?? undefined,
    };
    if (sourceToken) {
      apiParams.sourceToken = sourceToken;
    }
    if (clientVerification.sessionId) {
      apiParams.sessionId = clientVerification.sessionId;
    }
    if (clientVerification.userId) {
      apiParams.userId = clientVerification.userId;
    }
    if (previousVerificationId) {
      apiParams.verificationId = previousVerificationId;
    }
    console.log("API params", apiParams);
    const fetchConfig: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiParams),
    };

    // Call our Internal API to process the checkpoint
    // The returned object should contain a verification object
    const endpointResponse = await authenticatedFetch({
      route: ApiRoutes.CHECKPOINT,
      method: "POST",
      options: fetchConfig,
    });
    const responseData = (await endpointResponse.json()) as IExecuteServerCheckpointResult;
    console.log("Dodgeball response", responseData);

    const verification = responseData.verification;
    if (!verification) {
      throw new Error("No verification object returned from the endpoint");
    }

    const customMessage = getCustomMessageFromVerification(verification);
    if (customMessage) {
      console.log("Received custom message...\n" + customMessage);
    }

    dodgeball.handleVerification(verification, {
      onVerified: async (verification) => {
        // Call recursively if an additional step is required
        const nextParams: IProcessClientVerification = {
          dodgeball: dodgeball,
          clientVerification: clientVerification,
          callbacks: callbacks,
        };
        console.log("Next params", nextParams, "for verification", verification);
        await processDodgeballVerification(nextParams, verification.id);
      },
      onApproved: callbacks.onApproved,
      onDenied: callbacks.onDenied,
      onError: callbacks.onError,
    });
  } catch (error) {
    console.error("Error handling Dodgeball verification", error);
    const errorType: any = "SYSTEM";
    const errorDetails = error instanceof Error ? error.message : "Unknown error";
    const errorObject: IVerificationError = {
      errorType,
      details: errorDetails,
    };
    await clientParams?.callbacks?.onError(errorObject);
  }
};

/**
 * Get a custom message from a verification object
 * @param verification The verification object to get the custom message from
 * @returns The custom message, or null if no custom message is found
 */
export const getCustomMessageFromVerification = (
  verification: IVerification
): string | null | Record<string, unknown> => {
  if (verification.stepData?.customMessage) {
    try {
      return JSON.parse(verification.stepData.customMessage) as Record<string, unknown>;
    } catch (err) {
      return verification.stepData.customMessage;
    }
  }
  return null;
};

/**
 * Get the client's public IP address using an external service
 * @returns Promise<string | null> The client's public IP address or null if failed
 */
export const getClientIpAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = (await response.json()) as { ip: string };
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return null;
  }
};
