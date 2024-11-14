"use client";

import { Dodgeball } from "@dodgeball/trust-sdk-client";
import { nanoid } from "nanoid";

export type DodgeballState = {
  dodgeball: Dodgeball | null;
  userId: string | null;
  sessionId: string | null;
  submitButtonAction: "event" | "checkpoint";
  checkpointName: string;
  checkpointPayload: Record<string, unknown>;
  checkpointPayloadIsValid: boolean;
  serverEventName: string;
  serverEventPayload: Record<string, unknown>;
  serverEventPayloadIsValid: boolean;
  messages: { jsDate: Date; message: string; color?: string }[];
};

export const defaultDodgeballState: DodgeballState = {
  dodgeball: null,
  userId: `user-${nanoid()}`,
  sessionId: `sess-${nanoid()}`,
  submitButtonAction: "checkpoint",
  checkpointName: "EXAMPLE_CHECKPOINT",
  checkpointPayload: {
    mfa: {
      phoneNumbers: "ENTER_PHONE",
    },
    customer: {
      primaryEmail: "john.doe@example.com",
      primaryPhone: "+15555555555",
      firstName: "John",
      lastName: "Doe",
    },
    transaction: {
      externalId: nanoid(),
      amount: 99,
      currency: "USD",
    },
  },
  checkpointPayloadIsValid: true,
  serverEventName: "EXAMPLE_EVENT",
  serverEventPayload: {
    example: "payload",
  },
  serverEventPayloadIsValid: true,
  messages: [],
};

export class DodgeballStateSetters {
  /** Returns the new state */
  static setState(state: DodgeballState, newState: Partial<DodgeballState>): DodgeballState {
    const updatedState = { ...state, ...newState };
    return updatedState;
  }

  /** Returns the new state */
  static addMessage(state: DodgeballState, message: string, color?: string): DodgeballState {
    const fullMessage = { jsDate: new Date(), message, color };
    const previousMessages = DodgeballStateGetters.getState(state).messages;
    const updatedState = DodgeballStateSetters.setState(state, {
      messages: [fullMessage, ...previousMessages],
    });
    return updatedState;
  }

  /** Returns the new state */
  static clearMessages(state: DodgeballState): DodgeballState {
    const updatedState = DodgeballStateSetters.setState(state, { messages: [] });
    return updatedState;
  }

  /** Returns the new state */
  static setDodgeball(state: DodgeballState, dodgeball: Dodgeball): DodgeballState {
    let updatedState = DodgeballStateSetters.setState(state, { dodgeball });
    updatedState = DodgeballStateSetters.addMessage(updatedState, "Dodgeball initialized");
    const { sessionId, userId } = updatedState;
    if (sessionId) {
      dodgeball.track(sessionId, userId ?? undefined);
      updatedState = DodgeballStateSetters.addMessage(
        updatedState,
        `Dodgeball tracking session/user (${sessionId}/${userId})`,
        "green"
      );
    }
    return updatedState;
  }

  /** Returns the new state */
  static setSessionUser(
    state: DodgeballState,
    sessionId: string | null,
    userId: string | null
  ): DodgeballState {
    const { dodgeball } = DodgeballStateGetters.getState(state);
    let updatedState = DodgeballStateSetters.setState(state, { sessionId, userId });
    if (dodgeball && sessionId) {
      dodgeball.track(sessionId, userId ?? undefined);
      updatedState = DodgeballStateSetters.addMessage(
        updatedState,
        `Dodgeball tracking session/user (${sessionId}/${userId})`,
        "green"
      );
    }
    return updatedState;
  }

  /** Returns the new state */
  static setSubmitButtonAction(
    state: DodgeballState,
    action: "event" | "checkpoint"
  ): DodgeballState {
    const updatedState = DodgeballStateSetters.setState(state, { submitButtonAction: action });
    return updatedState;
  }
  /** Returns the new state */
  static setCheckpointName(state: DodgeballState, checkpointName: string): DodgeballState {
    const updatedState = DodgeballStateSetters.setState(state, { checkpointName });
    return updatedState;
  }
  /** Returns the new state */
  static setCheckpointPayload(
    state: DodgeballState,
    rawCheckpointPayload: string
  ): DodgeballState {
    let updatedState = state;
    try {
      const parsedPayload = JSON.parse(rawCheckpointPayload);
      updatedState = DodgeballStateSetters.setState(state, {
        checkpointPayload: parsedPayload,
        checkpointPayloadIsValid: true,
      });
    } catch (e) {
      updatedState = DodgeballStateSetters.setState(state, {
        checkpointPayloadIsValid: false,
      });
      updatedState = DodgeballStateSetters.addMessage(
        updatedState,
        "Error parsing checkpoint payload" + e
      );
    }
    return updatedState;
  }

  /** Returns the new state */
  static setServerEventName(state: DodgeballState, serverEventName: string): DodgeballState {
    const updatedState = DodgeballStateSetters.setState(state, { serverEventName });
    return updatedState;
  }

  /** Returns the new state */
  static setServerEventPayload(
    state: DodgeballState,
    rawServerEventPayload: string
  ): DodgeballState {
    let updatedState = state;
    try {
      const parsedPayload = JSON.parse(rawServerEventPayload);
      updatedState = DodgeballStateSetters.setState(state, {
        serverEventPayload: parsedPayload,
        serverEventPayloadIsValid: true,
      });
    } catch (e) {
      updatedState = DodgeballStateSetters.setState(state, {
        serverEventPayloadIsValid: false,
      });
      updatedState = DodgeballStateSetters.addMessage(
        updatedState,
        "Error parsing server event payload" + e
      );
    }
    return updatedState;
  }
}

export class DodgeballStateGetters {
  static getState(state: DodgeballState): DodgeballState {
    return state;
  }

  static getDodgeball(state: DodgeballState): Dodgeball | null {
    return state.dodgeball;
  }

  static getUserId(state: DodgeballState): string | null {
    return state.userId;
  }

  static getSessionId(state: DodgeballState): string | null {
    return state.sessionId;
  }

  static getSubmitButtonAction(state: DodgeballState): "event" | "checkpoint" {
    return state.submitButtonAction;
  }

  static getMessages(state: DodgeballState): { jsDate: Date; message: string; color?: string }[] {
    return state.messages;
  }

  static getCheckpointName(state: DodgeballState): string {
    return state.checkpointName;
  }

  static getCheckpointPayload(state: DodgeballState): Record<string, unknown> {
    return state.checkpointPayload;
  }

  static getCheckpointPayloadIsValid(state: DodgeballState): boolean {
    return state.checkpointPayloadIsValid;
  }

  static getServerEventName(state: DodgeballState): string {
    return state.serverEventName;
  }

  static getServerEventPayload(state: DodgeballState): Record<string, unknown> {
    return state.serverEventPayload;
  }

  static getServerEventPayloadIsValid(state: DodgeballState): boolean {
    return state.serverEventPayloadIsValid;
  }
}
