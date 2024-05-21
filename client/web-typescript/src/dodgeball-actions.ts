import globalState from "./state";

export interface IProcessCheckpointApiParams {
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

export interface IProcessServerEventApiParams {
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

interface IExecuteDodgeballCheckpointResult {
  // Did the checkpoint execute successfully?
  success: boolean;
  // The status of the checkpoint execution
  // You can use any status here, but we have provided some simple options below
  status: string;
  // The verification object returned from the checkpoint
  // This contains information about the verification
  // that should be sent to the frontend for handling
  verification: unknown;
  // An error message if the checkpoint failed
  errorMessage?: string;
}

const doSomethingWhenErrorOccurs = (message: string) => {
  globalState.addMessage("doSomethingWhenErrorOccurs called with message: " + JSON.stringify(message), "crimson");
};

const doSomethingWhenApproved = () => {
  globalState.addMessage("doSomethingWhenApproved called", "green");
};

const doSomethingWhenDenied = () => {
  globalState.addMessage("doSomethingWhenDenied called", "red");
};

const doSomethingWhenEventSubmittedSuccesfully = () => {
  globalState.addMessage("doSomethingWhenEventSubmittedSuccesfully called", "green");
};

export const sendServerEvent = async (apiParams: IProcessServerEventApiParams) => {
  const dodgeball = globalState.getDodgeball();
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
  const responseData: IExecuteDodgeballCheckpointResult = await endpointResponse.json();

  if (!endpointResponse.ok || !responseData.success) {
    // Handle any error response from your API
    const errorData = responseData;
    doSomethingWhenErrorOccurs(JSON.stringify(errorData));
  } else {
    doSomethingWhenEventSubmittedSuccesfully();
  }

  // Handle the response from your API
  // In this case, we are not handling the response as it is not required
  // If you need to handle the response, you can do so here
  console.log("Server Event Response", responseData);
};

export const processCheckpoint = async (
  apiParams: IProcessCheckpointApiParams,
  // This will only be sent when the function is called recursively (e.g. after a second step client side step is completed)
  previousVerificationId: string | null = null
) => {
  try {
    const dodgeball = globalState.getDodgeball();
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
    const responseData: IExecuteDodgeballCheckpointResult = await endpointResponse.json();

    dodgeball.handleVerification(responseData.verification as any, {
      onVerified: async (verification) => {
        // Call recursively if an additional step is required
        await processCheckpoint(apiParams, verification.id);
      },
      onApproved: async () => {
        // If no additional check was required, update the view to show that the order was placed
        doSomethingWhenApproved();
      },
      onDenied: async () => {
        // If the action was denied, update the view to show the rejection
        doSomethingWhenDenied();
      },
      onError: async (error) => {
        let errorMessage = "No Details Provided";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        // If there was an error performing the verification, display it
        doSomethingWhenErrorOccurs("Dodgeball received Error status: " + errorMessage);
      },
    });
  } catch (error) {
    let errorMessage = "Unknown Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    doSomethingWhenErrorOccurs("An error occurred while processing the checkpoint: " + errorMessage);
  }
};
