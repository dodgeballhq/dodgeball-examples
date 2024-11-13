"use client";

import { FC } from "react";
import dodgeballGlobalState from "../helpers/state";

interface StateViewerProps {
  state: any 
}
export const StateViewer: FC<StateViewerProps> = ({ state }) => {
  if (!state) {
    state = {
      messages: [],
    };
  };
  return (
    <div className="state-viewer">
      <div>Dodgeball {dodgeballGlobalState.getDodgeball() ? "initialized" : "not initialized"}</div>
      <div>Using API: {dodgeballGlobalState.getDodgeball() ? "Yes" : "No"}</div>
      <div>Submit Button Action: {dodgeballGlobalState.getSubmitButtonAction()}</div>
      <div>Session ID: {dodgeballGlobalState.getSessionId() ?? "No session ID"}</div>
      <div>User ID: {dodgeballGlobalState.getUserId() ?? "No user ID"}</div>
      <div>Checkpoint Name: {dodgeballGlobalState.getCheckpointName()}</div>
      <div>Checkpoint Payload: {JSON.stringify(dodgeballGlobalState.getCheckpointPayload())}</div>
      <div>Checkpoint Payload is Valid: {dodgeballGlobalState.getCheckpointPayloadIsValid() ? "Yes" : "No"}</div>
      <div>Server Event Name: {dodgeballGlobalState.getServerEventName()}</div>
      <div>Server Event Payload: {JSON.stringify(dodgeballGlobalState.getServerEventPayload())}</div>
      <div>Server Event Payload is Valid: {dodgeballGlobalState.getServerEventPayloadIsValid() ? "Yes" : "No"}</div>
      <div>Message Count: {dodgeballGlobalState.getMessages().length ?? 0}</div>
    </div>
  )
};
