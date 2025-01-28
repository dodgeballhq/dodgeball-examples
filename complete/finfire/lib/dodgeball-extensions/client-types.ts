import { Dodgeball as DodgeballClient } from "@dodgeball/trust-sdk-client/dist/types/Dodgeball";
import { IVerification, IVerificationError } from "@dodgeball/trust-sdk-client/dist/types/types";

export type { IVerification, IVerificationError };

/**
 * Common Client Data to be sent to the backend
 * This is used to pass data to the backend for processing by Dodgeball
 */
interface IClientData {
  /** The data to be sent to the checkpoint
   * This structure will depend on the checkpoint being processed and the handling of the data on the backend
   */
  payload: Record<string, unknown>;
}

/**
 * Verification parameters to send to the backend
 * These point to the checkpoint to be processed by Dodgeball
 * And pass an id to track the verification
 */
export interface IClientVerification extends IClientData {
  /** Name of the checkpoint to be processed */
  checkpointName: string;
  /** The source token to be used for the verification */
  sourceToken: string | null;
  /** (Optional) The session ID to be used for the verification */
  sessionId?: string;
  /** (Optional) The user ID to be used for the verification */
  userId?: string;
}

export type IClientVerificationCallback = (verification: IVerification) => Promise<void>;
export type IClientVerificationErrorCallback = (error: IVerificationError) => Promise<void>;

/**
 * Client side callbacks to handle the verification results
 */
export interface IClientVerificationCallbacks {
  /** Callback to handle the approved verification */
  onApproved: IClientVerificationCallback;
  /** Callback to handle the denied verification */
  onDenied: IClientVerificationCallback;
  /** Callback to handle the verification error */
  onError: IClientVerificationErrorCallback;
}

/**
 * Information Required from the Client to Process the Dodgeball Verification
 */
export interface IProcessClientVerification {
  /** Dodgeball Client SDK instance */
  dodgeball: DodgeballClient | null | undefined;
  clientVerification: IClientVerification;
  callbacks: IClientVerificationCallbacks;
}
