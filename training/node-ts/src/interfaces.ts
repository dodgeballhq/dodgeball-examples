export interface IExecuteDodgeballCheckpointParams {
  // Name of the checkpoint to be processed
  checkpointName: string;
  // Data sent from the client side to the server
  // This structure will depend on the checkpoint being processed and the handling of the data on the backend
  payload: Record<string, unknown>;
  // You can pass in a Session ID here, or set it on the backend in order to label the session
  // with your own identifier
  sourceToken?: string;
  // (SET AUTOMATICALLY) The verification ID to use for the checkpoint
  // This is used when there are multiple verifications for a checkpoint
  // For example, if you have a checkpoint that requires MFA or IDV
  // The verification will be sent to the frontend to handle the additional checks
  verificationId?: string;
}

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

export interface IProcessDodgeballCheckpointResult {
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
  // An error message if the event failed
  errorMessage?: string;
}
