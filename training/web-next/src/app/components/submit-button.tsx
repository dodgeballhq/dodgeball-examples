"use client";

import { FC, useMemo } from "react";
import { IProcessDodgeballCheckpointApiParams, IProcessDodgeballServerEventApiParams, processCheckpoint, sendServerEvent } from "../actions/dodgeball-actions";
import { useCheckpointStateContext } from "../contexts/CheckpointStateProvider";
import { useDodgeballProvider } from "../contexts/DodgeballProvider";

export const SubmitButton: FC = () => {
  const { currentCheckpointState, addMessage, clearMessages } = useCheckpointStateContext();
  const { dodgeball } = useDodgeballProvider();
  const getCorrectInnerText = () => {
    const submitButtonAction = currentCheckpointState.submitButtonAction;
    return submitButtonAction === "checkpoint" ? "Call Checkpoint" : "Send Server Event";
  };

  const onSubmitClick = async () => {
    const submitButtonAction = currentCheckpointState.submitButtonAction;
    switch (submitButtonAction) {
      case "checkpoint":
          await submitCheckpoint();
          break;
        case "event":
          await submitEvent();
        break;
    }
  };

  const submitCheckpoint = async () => {
    clearMessages();
    const checkpointName = currentCheckpointState.checkpointName;
    addMessage("processCheckpoint called for checkpoint: " + checkpointName);
    const processCheckpointApiParams: IProcessDodgeballCheckpointApiParams = {
      checkpointName: checkpointName ?? "UNSET_CHECKPOINT_NAME",
      payload: currentCheckpointState.checkpointPayload,
      sessionId: currentCheckpointState.sessionId ?? undefined,
      userId: currentCheckpointState.userId ?? undefined,
    };
    await processCheckpoint(dodgeball, addMessage, processCheckpointApiParams);
  };

  const submitEvent = async () => {
    clearMessages();
    const serverEventName = currentCheckpointState.serverEventName;
    addMessage("sendServerEvent called for event: " + serverEventName);
    const processServerEventApiParams: IProcessDodgeballServerEventApiParams = {
      eventName: serverEventName ?? "UNSET_SERVER_EVENT_NAME",
      payload: currentCheckpointState.serverEventPayload,
      sessionId: currentCheckpointState.sessionId ?? undefined,
      userId: currentCheckpointState.userId ?? undefined,
    };
    await sendServerEvent(dodgeball, addMessage, processServerEventApiParams);
  };

  const issues = useMemo(() => {
    const submitButtonAction = currentCheckpointState.submitButtonAction;
    const sessionId = currentCheckpointState.sessionId;
    const checkpointPayloadIsValid = currentCheckpointState.checkpointPayloadIsValid;
    const serverEventPayloadIsValid = currentCheckpointState.serverEventPayloadIsValid;
    const issues = [];
    if (!dodgeball) {
      issues.push("Dodgeball not initialized");
    }
    if (!sessionId) {
      issues.push("No session ID");
    }
    if (submitButtonAction === "checkpoint" && !checkpointPayloadIsValid) {
      issues.push("Invalid checkpoint payload - must be valid JSON");
    }
    if (submitButtonAction === "event" && !serverEventPayloadIsValid) {
      issues.push("Invalid server event payload");
    }
    return issues;
  }, [currentCheckpointState, dodgeball]);

  return (
    <div className="flex flex-col">
      <div className="submit-button-container">
        <button
          id="submit" 
          onClick={onSubmitClick} 
          className={`${issues.length > 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""}`}
          disabled={issues.length > 0}
          >
            {getCorrectInnerText()}
        </button>
      </div>
      {issues.length > 0 && <div className="submit-button-messages">{issues.join(", ")}</div>}
    </div>
  )
};
