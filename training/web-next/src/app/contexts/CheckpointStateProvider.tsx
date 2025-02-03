"use client";

import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
import { createContext, useContext, useEffect, useState } from "react";
/** use these to apply tailwind classes to messages */
export enum MessageColor {
  RED = "text-red-700",
  GREEN = "text-green-700",
  GREY = "text-gray-700",
  BLUE = "text-blue-700",
  YELLOW = "text-yellow-700",
}

export type CheckpointState = {
  userId: string | null;
  sessionId: string | null;
  submitButtonAction: "event" | "checkpoint";
  checkpointName: string | null;
  rawCheckpointPayload: string | null;
  checkpointPayload: Record<string, unknown>;
  checkpointPayloadIsValid: boolean;
  serverEventName: string | null;
  rawServerEventPayload: string | null;
  serverEventPayload: Record<string, unknown>;
  serverEventPayloadIsValid: boolean;
  messages: { jsDate: Date; message: string; color?: MessageColor }[];
};

const mfaPhoneFromEnv = process.env.NEXT_PUBLIC_TEST_MFA_PHONE;
const mfaEmailFromEnv = process.env.NEXT_PUBLIC_TEST_MFA_EMAIL;

export const defaultCheckpointState: CheckpointState = {
  userId: `default-user-id`,
  sessionId: `default-session-id`,
  submitButtonAction: "checkpoint",
  checkpointName: "EXAMPLE_CHECKPOINT",
  rawCheckpointPayload: null,
  checkpointPayload: { example: "payload" },
  checkpointPayloadIsValid: true,
  serverEventName: "EXAMPLE_EVENT",
  rawServerEventPayload: null,
  serverEventPayload: { example: "payload" },
  serverEventPayloadIsValid: true,
  messages: [],
};

interface ICheckpointStateContext {
  currentCheckpointState: CheckpointState;
  updateCheckpointState: (values: Partial<CheckpointState>) => void;
  setCheckpointOrEventPayload: (payloadString: string) => void;
  addMessage: (message: string, color?: MessageColor) => void;
  clearMessages: () => void;
}

const CheckpointStateContext = createContext<ICheckpointStateContext | undefined>(undefined);

export const useCheckpointStateContext = () => {
  const context = useContext(CheckpointStateContext);
  if (!context) {
    throw new Error("useCheckpointStateContext must be used within a CheckpointStateProvider");
  }
  return context;
};

interface CheckpointStateProviderProps {
  children: React.ReactNode;
}

export const CheckpointStateProvider: React.FC<CheckpointStateProviderProps> = ({ children }) => {
  const [checkpointState, setCheckpointState] = useState<CheckpointState>(defaultCheckpointState);

  /**
   * Page load effect - set default page state
   */
  useEffect(() => {
    const userId = `user-${nanoid()}`;
    const sessionId = `sess-${nanoid()}`;
    const transactionExternalId = `trans-${nanoid()}`;
    const transactionAmount = faker.number.int({ min: 1, max: 10000 });
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const checkpointPayload = {
      mfa: {
        phoneNumbers: mfaPhoneFromEnv ?? "ENTER_PHONE",
        emailAddresses: mfaEmailFromEnv ?? "ENTER_EMAIL",
      },
      customer: {
        primaryEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        primaryPhone: faker.phone.number({style: "international"}),
        firstName,
        lastName,
      },
      transaction: {
        externalId: transactionExternalId,
        amount: transactionAmount,
        currency: "USD",
      },
    };
    setCheckpointState(() => ({
      ...defaultCheckpointState,
      userId,
      sessionId,
      checkpointPayload,
      rawCheckpointPayload: JSON.stringify(checkpointPayload, null, 2),
    }));
  }, [defaultCheckpointState]);

  const updateState = (values: Partial<CheckpointState>) => {
    setCheckpointState((prevState) => ({
      ...prevState,
      ...values,
    }));
  };

  const addMessage = (message: string, color?: MessageColor) => {
    setCheckpointState((prevState) => ({
      ...prevState,
      messages: [{ jsDate: new Date(), message, color },...prevState.messages],
    }));
  };

  const clearMessages = () => {
    setCheckpointState((prevState) => ({
      ...prevState,
      messages: [],
    }));
  };

  const getParsedPayload = (payloadString: string) => {
    try {
      const payload = JSON.parse(payloadString);
      return payload;
    } catch (error) {
      return null;
    }
  };

  const setCheckpointOrEventPayload = (payloadString: string) => {
    const submitButtonAction = checkpointState.submitButtonAction;
    if (submitButtonAction === "checkpoint") {
      const parsedPayload = getParsedPayload(payloadString);
      const isValid = parsedPayload !== null;
      if (isValid) {
        updateState({ checkpointPayload: parsedPayload, rawCheckpointPayload: payloadString, checkpointPayloadIsValid: isValid });
      } else {
        updateState({ rawCheckpointPayload: payloadString, checkpointPayloadIsValid: false });
      }
    } else if (submitButtonAction === "event") {
      const parsedPayload = getParsedPayload(payloadString);
      const isValid = parsedPayload !== null;
      if (isValid) {
        updateState({ serverEventPayload: parsedPayload, rawServerEventPayload: payloadString, serverEventPayloadIsValid: isValid });
      } else {
        updateState({ rawServerEventPayload: payloadString, serverEventPayloadIsValid: false });
      }
    }
  };

  return (
    <CheckpointStateContext.Provider
      value={{ currentCheckpointState: checkpointState, updateCheckpointState: updateState, addMessage, clearMessages, setCheckpointOrEventPayload }}
    >
      {children}
    </CheckpointStateContext.Provider>
  );
};
