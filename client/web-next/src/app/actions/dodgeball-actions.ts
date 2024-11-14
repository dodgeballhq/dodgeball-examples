import { IVerification } from "@dodgeball/trust-sdk-client/dist/types/types";
import { DodgeballState, DodgeballStateGetters, DodgeballStateSetters } from "../helpers/dodgeball-state";

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
const onFailDodgeballSubmitEvent = (state: DodgeballState) => {
  DodgeballStateSetters.addMessage(state, "onFailDodgeballSubmitEvent called", "red");
};

const onSuccessDodgeballSubmitEvent = (state: DodgeballState) => {
  DodgeballStateSetters.addMessage(state, "onSuccessDodgeballSubmitEvent called", "green");
};

export const sendServerEvent = async (state: DodgeballState, apiParams: IProcessDodgeballServerEventApiParams) => {
  const dodgeball = DodgeballStateGetters.getDodgeball(state);
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
    onFailDodgeballSubmitEvent(state);
  } else {
    onSuccessDodgeballSubmitEvent(state);
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
const onCheckpointError = (state: DodgeballState, verification: IVerification | null, message: string) => {
  console.log("onCheckpointError called", verification, message);
  DodgeballStateSetters.addMessage(state, "onCheckpointError called with message: " + JSON.stringify(message), "red");
};

const onCheckpointApproved = (state: DodgeballState, verification: IVerification) => {
  console.log("onCheckpointApproved called", verification);
  DodgeballStateSetters.addMessage(state, "onCheckpointApproved called", "green");
};

const onCheckpointDenied = (state: DodgeballState, verification: IVerification) => {
  console.log("onCheckpointDenied called", verification);
  DodgeballStateSetters.addMessage(state, "onCheckpointDenied called", "orange");
};

export const processCheckpoint = async (
  state: DodgeballState,
  apiParams: IProcessDodgeballCheckpointApiParams,
  // This will only be sent when the function is called recursively (e.g. after a second step client side step is completed)
  previousVerificationId: string | null = null
) => {
  try {
    const dodgeball = DodgeballStateGetters.getDodgeball(state);
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
        DodgeballStateSetters.addMessage(state, "Received custom message...\n" + JSON.stringify(JSON.parse(verification.stepData.customMessage), null, 2));
      } catch (err) {
        DodgeballStateSetters.addMessage(state, "Received custom message...\n" + verification.stepData.customMessage);
      }
    }

    dodgeball.handleVerification(verification, {
      onVerified: async (verification) => {
        // Call recursively if an additional step is required
        DodgeballStateSetters.addMessage(state, `Checkpoint verification ${verification.id} received, processing next step`);
        await processCheckpoint(state, apiParams, verification.id);
      },
      onApproved: async (verification) => {
        // Handle the approved action
        onCheckpointApproved(state, verification);
      },
      onDenied: async (verification) => {
        // Handle the denied action
        onCheckpointDenied(state, verification);
      },
      onError: async (error) => {
        // Handle the checkpoint error
        let errorMessage = "No Details Provided";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        onCheckpointError(state, verification, "Dodgeball received Error status: " + errorMessage);
      },
    });
  } catch (error) {
    // Handle the processing error
    let errorMessage = "Unknown Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    onCheckpointError(state, null, "An error occurred while processing the checkpoint: " + errorMessage);
  }
};
