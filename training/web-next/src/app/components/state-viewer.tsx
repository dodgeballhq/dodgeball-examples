"use client";

import { FC } from "react";
import { useCheckpointStateContext } from "../contexts/CheckpointStateProvider";
import { useDodgeballProvider } from "../contexts/DodgeballProvider";

export const StateViewer: FC = () => {
  const { currentCheckpointState } = useCheckpointStateContext();
  const { dodgeball } = useDodgeballProvider();
  return (
    <div className="state-viewer">
      <div>Dodgeball {dodgeball ? "initialized" : "not initialized"}</div>
      <div>Using API: {dodgeball ? "Yes" : "No"}</div>
      <div>Submit Button Action: {currentCheckpointState.submitButtonAction}</div>
      <div>Session ID: {currentCheckpointState.sessionId ?? "No session ID"}</div>
      <div>User ID: {currentCheckpointState.userId ?? "No user ID"}</div>
      <div>Checkpoint Name: {currentCheckpointState.checkpointName}</div>
      <div>Checkpoint Payload: {JSON.stringify(currentCheckpointState.checkpointPayload)}</div>
      <div>Checkpoint Payload is Valid: {currentCheckpointState.checkpointPayloadIsValid ? "Yes" : "No"}</div>
      <div>Server Event Name: {currentCheckpointState.serverEventName}</div>
      <div>Server Event Payload: {JSON.stringify(currentCheckpointState.serverEventPayload)}</div>
      <div>Server Event Payload is Valid: {currentCheckpointState.serverEventPayloadIsValid ? "Yes" : "No"}</div>
      <div>Message Count: {currentCheckpointState.messages.length ?? 0}</div>
    </div>
  )
};
