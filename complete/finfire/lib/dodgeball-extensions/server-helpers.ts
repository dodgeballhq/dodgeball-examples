import {
  IExecuteServerCheckpointRequest,
  IExecuteServerCheckpointResult,
  IExecuteServerEventRequest,
  IExecuteServerEventResult,
} from "@/lib/dodgeball-extensions/server-types";
import { IVerification } from "@dodgeball/trust-sdk-client/dist/types/types";
import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-server";
import { ICheckpointOptions } from "@dodgeball/trust-sdk-server/dist/types/types";
import { serverEnv, sharedEnv } from "../environment";

// Get environment variables
const DODGEBALL_PRIVATE_API_KEY = serverEnv.dodgeball.privateApiKey;
const DODGEBALL_API_URL = sharedEnv.dodgeball.apiUrl;

// Validate environment variables at startup
if (!DODGEBALL_PRIVATE_API_KEY || !DODGEBALL_API_URL) {
  console.warn("Missing required Dodgeball configuration. API calls will fail.");
}

// Initialize the SDK only if credentials are available
const dodgeball =
  DODGEBALL_PRIVATE_API_KEY && DODGEBALL_API_URL
    ? new Dodgeball(DODGEBALL_PRIVATE_API_KEY, {
        apiVersion: DodgeballApiVersion.v1,
        apiUrl: DODGEBALL_API_URL,
      })
    : null;

/**
 * Get an error response for the checkpoint
 * @param errorMessage - The error message to include in the response
 * @returns The error response
 */
export const getErrorResponse = (errorMessage: string) => {
  const baseErrorResponse = {
    success: false,
    status: "isError",
    verification: null,
  };
  return {
    ...baseErrorResponse,
    errorMessage,
  };
};

/**
 * Executes a Dodgeball checkpoint with the given parameters
 * @param executionParams - The parameters for processing the checkpoint
 * @param ipAddress - The IP address of the device making the request.
 * You could use the request object (for example an Express.js request) to get the IP address
 * @returns Promise containing the checkpoint execution result
 */
export const executeDodgeballCheckpoint = async (
  executionParams: IExecuteServerCheckpointRequest,
  requestIpAddress: string
): Promise<IExecuteServerCheckpointResult> => {
  const { checkpointName, payload, sourceToken, verificationId, sessionId, userId } = executionParams;
  // Validate required parameters
  if (!checkpointName) {
    return getErrorResponse("Invalid checkpoint name");
  }

  if (!dodgeball) {
    return getErrorResponse("Dodgeball not properly configured");
  }

  // Prefer the client IP address if provided, otherwise use the request IP address
  let ipAddress = executionParams.clientIpAddress;
  if (!ipAddress) {
    ipAddress = requestIpAddress;
  }

  // If the IP address is a local IP address, set it to an empty string
  const localIpAddresses = ["::1", "127.0.0.1"];
  if (localIpAddresses.includes(ipAddress ?? "")) {
    ipAddress = "";
  }

  try {
    // Create the checkpoint payload
    const checkpointPayload: ICheckpointOptions = {
      checkpointName,
      event: {
        ip: ipAddress?.trim() || "",
        data: {
          ...(payload ?? {}),
          exampleValueFromBackendOnly: "EXAMPLE_VALUE",
        },
      },
    };
    // Add optional parameters if they are provided
    if (sourceToken) {
      checkpointPayload.sourceToken = sourceToken;
    }
    if (sessionId) {
      checkpointPayload.sessionId = sessionId;
    }
    if (userId) {
      checkpointPayload.userId = userId;
    }
    if (verificationId) {
      checkpointPayload.useVerificationId = verificationId;
    }

    // Call the Dodgeball Server SDK to execute the checkpoint
    const checkpointResponse = await dodgeball.checkpoint(checkpointPayload);

    // Validate and Standardize the response
    if (!checkpointResponse) {
      return getErrorResponse("Invalid checkpoint response");
    }

    const verification = (checkpointResponse?.verification ?? null) as IVerification | null;

    const baseResponse: Omit<IExecuteServerCheckpointResult, "status"> = {
      success: true,
      verification,
    };

    // Handle the checkpoint response
    if (dodgeball.isAllowed(checkpointResponse)) {
      return { ...baseResponse, status: "isAllowed" };
    }
    if (dodgeball.isRunning(checkpointResponse)) {
      return { ...baseResponse, status: "isRunning" };
    }
    if (dodgeball.isDenied(checkpointResponse)) {
      return { ...baseResponse, status: "isDenied" };
    }

    const errorMessage = checkpointResponse.errors
      ? JSON.stringify(checkpointResponse.errors)
      : "Unhandled Checkpoint Response Status";
    return getErrorResponse(errorMessage);
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : "Error processing checkpoint request";
    return getErrorResponse(errorMessage);
  }
};

export const executeDodgeballEvent = async (event: IExecuteServerEventRequest): Promise<IExecuteServerEventResult> => {
  const { eventName, payload, sourceToken, userId, sessionId } = event;
  console.log("Executing Dodgeball event", event);
  try {
    if (!dodgeball) {
      throw new Error("Dodgeball not properly configured");
    }
    await dodgeball.event({
      event: {
        type: eventName,
        data: payload,
        eventTime: Date.now(),
      },
      sourceToken,
      userId,
      sessionId,
    });
    return {
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error processing event request";
    return {
      success: false,
      errorMessage,
    };
  }
};
