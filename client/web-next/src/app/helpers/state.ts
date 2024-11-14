import { Dodgeball } from "@dodgeball/trust-sdk-client";
import { nanoid } from "nanoid";

type DodgeballState = {
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

class GlobalDodgeballState {
  private state: DodgeballState = {
    dodgeball: null,
    userId: null,
    sessionId: null,
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
  listeners: Record<string, () => void> = {};

  public getState() {
    return this.state;
  }

  private setState(newState: Partial<DodgeballState>) {
    this.state = { ...this.state, ...newState };
    // console.log("New state", this.state, this.listeners);
    this.notifyListeners();
  }

  public setDodgeball(dodgeball: Dodgeball) {
    this.setState({ dodgeball });
    this.addMessage("Dodgeball initialized");
    const { sessionId, userId } = this.state;
    if (sessionId) {
      dodgeball.track(sessionId, userId ?? undefined);
      this.addMessage(`Dodgeball tracking session/user (${sessionId}/${userId})`, "green");
    }
  }

  public getDodgeball(): Dodgeball | null {
    return this.getState().dodgeball;
  }

  public getUserId(): string | null {
    return this.getState().userId;
  }

  public getSessionId(): string | null {
    return this.getState().sessionId;
  }

  public setSessionUser(sessionId: string | null, userId: string | null) {
    const { dodgeball } = this.getState();
    this.setState({ sessionId, userId });
    if (dodgeball && sessionId) {
      dodgeball.track(sessionId, userId ?? undefined);
      this.addMessage(`Dodgeball tracking session/user (${sessionId}/${userId})`, "green");
    }
  }

  public getSubmitButtonAction() {
    const { submitButtonAction } = this.getState();
    return submitButtonAction;
  }

  public addMessage(message: string, color?: string) {
    const fullMessage = { jsDate: new Date(), message, color };
    const previousMessages = this.getState().messages;
    this.setState({ messages: [fullMessage, ...previousMessages] });
  }

  public clearMessages() {
    this.setState({ messages: [] });
  }

  public getMessages() {
    return this.getState().messages;
  }

  public setSubmitButtonAction(action: "event" | "checkpoint") {
    this.setState({ submitButtonAction: action });
  }

  public getCheckpointName() {
    return this.getState().checkpointName;
  }

  public setCheckpointName(checkpointName: string) {
    this.setState({ checkpointName });
  }

  public getCheckpointPayload() {
    return this.getState().checkpointPayload;
  }

  public getCheckpointPayloadIsValid() {
    return this.getState().checkpointPayloadIsValid;
  }

  public setCheckpointPayload(rawCheckpointPayload: string) {
    try {
      const parsedPayload = JSON.parse(rawCheckpointPayload);
      this.setState({ checkpointPayload: parsedPayload, checkpointPayloadIsValid: true });
    } catch (e) {
      this.setState({ checkpointPayloadIsValid: false });
      this.addMessage("Error parsing checkpoint payload" + e);
    }
  }

  public getServerEventName() {
    return this.getState().serverEventName;
  }

  public setServerEventName(serverEventName: string) {
    this.setState({ serverEventName });
  }

  public getServerEventPayload() {
    return this.getState().serverEventPayload;
  }

  public getServerEventPayloadIsValid() {
    return this.getState().serverEventPayloadIsValid;
  }

  public setServerEventPayload(rawServerEventPayload: string) {
    try {
      const parsedPayload = JSON.parse(rawServerEventPayload);
      this.setState({ serverEventPayload: parsedPayload, serverEventPayloadIsValid: true });
    } catch (e) {
      this.setState({ serverEventPayloadIsValid: false });
      this.addMessage("Error parsing server event payload" + e);
    }
  }

  public subscribe(key: string, listener: () => void) {
    console.log("Subscribing listener", key);
    this.listeners[key] = listener;
  }

  public unsubscribe(key: string) {
    if (this.listeners[key]) {
      delete this.listeners[key];
    }
  }

  private notifyListeners() {
    Object.entries(this.listeners)?.forEach(([key, listener]) => {
      // console.log("Notifying listener", key);
      listener();
    });
  }
}

const dodgeballGlobalState = new GlobalDodgeballState();
export default dodgeballGlobalState;
