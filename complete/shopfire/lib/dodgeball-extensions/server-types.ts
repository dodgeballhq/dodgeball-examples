import { IVerification } from "@dodgeball/trust-sdk-client/dist/types/types";

/**
 * Interface for processing Dodgeball checkpoint API parameters
 */
export interface IExecuteServerCheckpointRequest {
  /** Name of the checkpoint to be processed */
  checkpointName: string;
  /**
   * Data sent from the client side to the server.
   * This structure will depend on the checkpoint being processed and the handling of the data on the backend
   */
  payload: Record<string, unknown>;
  /**
   * Obtained from the Dodgeball Client SDK, represents the device making the request.
   * Source Tokens can only be used if they were recently generated as they expire
   */
  sourceToken?: string;
  /**
   * Optional session ID to use for the checkpoint.
   */
  sessionId?: string;
  /** Optional user ID to use for the checkpoint. */
  userId?: string;
  /**
   * Optional IP address of the client making the request
   * This is used to track the IP address of the client making the request
   */
  clientIpAddress?: string;
  /**
   * The verification ID to use for the checkpoint.
   * This is used when there are multiple verifications for a checkpoint.
   * For example, if you have a checkpoint that requires MFA or IDV.
   * The verification will be sent to the frontend to handle the additional checks
   */
  verificationId?: string;
}

export interface IExecuteServerCheckpointResult {
  /** Did the checkpoint execute successfully? */
  success: boolean;
  /** The status of the checkpoint execution
   * You can use any status here, but we have provided some simple options below
   */
  status: "isAllowed" | "isRunning" | "isDenied" | "isError";
  /** The verification object returned from the checkpoint
   * This contains information about the verification
   */
  verification: IVerification | null;
  /** An error message if the checkpoint failed */
  errorMessage?: string;
}

export interface IExecuteServerEventRequest {
  /** The name of the event to be processed */
  eventName: string;
  /**
   * Data sent from the client side to the server.
   * This structure will depend on the event being processed and the handling of the data on the backend
   */
  payload: Record<string, unknown>;
  /**
   * The source token to use for the event.
   * This is used when there are multiple devices for a user.
   */
  sourceToken?: string;
  /** Optional session ID to use for the event. */
  sessionId?: string;
  /** Optional user ID to use for the event. */
  userId?: string;
}

export interface IExecuteServerEventResult {
  success: boolean;
  errorMessage?: string;
}
