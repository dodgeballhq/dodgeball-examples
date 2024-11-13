import { FC } from "react";

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
      <div>Dodgeball {state.dodgeball ? "initialized" : "not initialized"}</div>
      <div>Using API: {state.dodgeball ? "Yes" : "No"}</div>
      <div>Submit Button Action: ${state.submitButtonAction}</div>
      <div>Session ID: ${state.sessionId ?? "No session ID"}</div>
      <div>User ID: ${state.userId ?? "No user ID"}</div>
      <div>Checkpoint Name: ${state.checkpointName}</div>
      <div>Checkpoint Payload: ${JSON.stringify(state.checkpointPayload)}</div>
      <div>Checkpoint Payload is Valid: ${state.checkpointPayloadIsValid ? "Yes" : "No"}</div>
      <div>Server Event Name: ${state.serverEventName}</div>
      <div>Server Event Payload: {JSON.stringify(state.serverEventPayload)}</div>
      <div>Server Event Payload is Valid: {state.serverEventPayloadIsValid ? "Yes" : "No"}</div>
      <div>Message Count: {state.messages?.length ?? 0}</div>
    </div>
  )
};
