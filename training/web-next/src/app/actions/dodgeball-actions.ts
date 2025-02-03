import { Dodgeball } from "@dodgeball/trust-sdk-client";
import { IVerification } from "@dodgeball/trust-sdk-client/dist/types/types";
import { MessageColor } from "../contexts/CheckpointStateProvider";

export interface IProcessDodgeballServerEventApiParams {
  // Name of the event to be processed
  eventName: string;
  // Data sent from the client side to the server
  // This structure will depend on the event being processed and the handling of the data on the backend
  payload: Record<string, unknown>;
  // You can pass in a Session ID here, or set it on the backend in order to label the session
  // with your own identifier
  sessionId?: string;
  // You can pass in a User ID here, or set it on the backend in order to label the user
  // with your own identifier
  userId?: string;
  // (SET AUTOMATICALLY) Obtained from the Dodgeball Client SDK, represents the device making the request.
  // Source Tokens can only be used if they were recently generated as they expire
  sourceToken?: string;
}

export interface IProcessDodgeballServerEventResult {
  // Did the event process successfully?
  success: boolean;
}

// These are very simple ways to handle the event submission
// You can add more complex logic here if desired
const onFailDodgeballSubmitEvent = (addMessage: (message: string, color: MessageColor) => void) => {
  addMessage("onFailDodgeballSubmitEvent called", MessageColor.RED);
};

const onSuccessDodgeballSubmitEvent = (addMessage: (message: string, color: MessageColor) => void) => {
  addMessage("onSuccessDodgeballSubmitEvent called", MessageColor.GREEN);
};

export const sendServerEvent = async (dodgeball: Dodgeball | null | undefined, addMessage: (message: string, color: MessageColor) => void, apiParams: IProcessDodgeballServerEventApiParams) => {
  if (!dodgeball) {
    throw new Error("Dodgeball SDK not initialized");
  }
  const sourceToken = await dodgeball?.getSourceToken();

  // Setup Request Headers to your API
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (sourceToken) {
    // Pass the source token to your API
    apiParams["sourceToken"] = sourceToken;
  }

  // Call your API with the necessary parameters
  // The returned object should contain a verification object
  const fetchConfig: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify(apiParams),
  };
  const endpointResponse = await fetch("http://localhost:3020/event", fetchConfig);
  const responseData: IProcessDodgeballServerEventResult = await endpointResponse.json();

  if (!endpointResponse.ok || !responseData.success) {
    onFailDodgeballSubmitEvent(addMessage);
  } else {
    onSuccessDodgeballSubmitEvent(addMessage);
  }
};

export interface IProcessDodgeballCheckpointApiParams {
  // Name of the checkpoint to be processed
  checkpointName: string;
  // Data sent from the client side to the server
  // This structure will depend on the checkpoint being processed and the handling of the data on the backend
  payload: Record<string, unknown>;
  // You can pass in a Session ID here, or set it on the backend in order to label the session
  // with your own identifier
  sessionId?: string;
  // You can pass in a User ID here, or set it on the backend in order to label the user
  // with your own identifier
  userId?: string;
  // (SET AUTOMATICALLY) Obtained from the Dodgeball Client SDK, represents the device making the request.
  // Source Tokens can only be used if they were recently generated as they expire
  sourceToken?: string;
  // (SET AUTOMATICALLY) The verification ID to use for the checkpoint
  // This is used when there are multiple verifications for a checkpoint
  // For example, if you have a checkpoint that requires MFA or IDV
  // The verification will be sent to the frontend to handle the additional checks
  verificationId?: string;
}

interface IProcessDodgeballCheckpointResult {
  // Did the checkpoint execute successfully?
  success: boolean;
  // The status of the checkpoint execution
  // You can use any status here, but we have provided some simple options below
  status: string;
  // The verification object returned from the checkpoint
  // This contains information about the verification
  // that should be sent to the frontend for handling
  verification: IVerification | null;
  // An error message if the checkpoint failed
  errorMessage?: string;
}

// These are very simple ways to handle the checkpoint execution
// You can add more complex logic here if desired
const onCheckpointError = (addMessage: (message: string, color: MessageColor) => void, verification: IVerification | null, message: string) => {
  console.log("onCheckpointError called", verification, message);
  addMessage("onCheckpointError called with message: " + JSON.stringify(message), MessageColor.RED);
};

const onCheckpointApproved = (addMessage: (message: string, color: MessageColor) => void, verification: IVerification) => {
  console.log("onCheckpointApproved called", verification);
  addMessage("onCheckpointApproved called", MessageColor.GREEN);
};

const onCheckpointDenied = (addMessage: (message: string, color: MessageColor) => void, verification: IVerification) => {
  console.log("onCheckpointDenied called", verification);
  addMessage("onCheckpointDenied called", MessageColor.RED);
};

export const processCheckpoint = async (
  dodgeball: Dodgeball | null | undefined,
  addMessage: (message: string, color?: MessageColor) => void,
  apiParams: IProcessDodgeballCheckpointApiParams,
  // This will only be sent when the function is called recursively (e.g. after a second step client side step is completed)
  previousVerificationId: string | null = null
) => {
  try {
    if (!dodgeball) {
      throw new Error("Dodgeball SDK not initialized");
    }
    const sourceToken = await dodgeball?.getSourceToken();

    // Setup Request Headers to your API
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    if (sourceToken) {
      // Pass the source token to your API
      apiParams["sourceToken"] = sourceToken;
    }
    if (previousVerificationId) {
      // If a previous verification was performed, pass it along to your API
      apiParams["verificationId"] = previousVerificationId;
    }

    // Call your API with the necessary parameters
    // The returned object should contain a verification object
    const fetchConfig: RequestInit = {
      method: "POST",
      headers,
      body: JSON.stringify(apiParams),
    };
    const endpointResponse = await fetch("http://localhost:3020/checkpoint", fetchConfig);
    const responseData: IProcessDodgeballCheckpointResult = await endpointResponse.json();

    const verification = responseData.verification;
    if (!verification) {
      throw new Error("No verification object returned from the endpoint");
    }

    if (verification.stepData?.customMessage) {
      try {
        addMessage("Received custom message...\n" + JSON.stringify(JSON.parse(verification.stepData.customMessage), null, 2), MessageColor.YELLOW);
      } catch (err) {
        console.log("Error parsing custom message", err);
        addMessage("Received custom message...\n" + verification.stepData.customMessage, MessageColor.YELLOW);
      }
    }

    dodgeball.handleVerification(verification, {
      onVerified: async (verification) => {
        // Call recursively if an additional step is required
        addMessage(`Checkpoint verification ${verification.id} received, processing next step`, MessageColor.BLUE);
        await processCheckpoint(dodgeball, addMessage, apiParams, verification.id);
      },
      onApproved: async (verification) => {
        // Handle the approved action
        onCheckpointApproved(addMessage, verification);
      },
      onDenied: async (verification) => {
        // Handle the denied action
        onCheckpointDenied(addMessage, verification);
      },
      onError: async (error) => {
        // Handle the checkpoint error
        let errorMessage = "No Details Provided";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        onCheckpointError(addMessage, verification, "Dodgeball received Error status: " + errorMessage);
      },
    });
  } catch (error) {
    // Handle the processing error
    let errorMessage = "Unknown Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    onCheckpointError(addMessage, null, "An error occurred while processing the checkpoint: " + errorMessage);
  }
};
