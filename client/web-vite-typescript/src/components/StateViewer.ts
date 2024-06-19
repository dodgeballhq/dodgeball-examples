import globalState from "../state";

export function createStateViewer() {
  return `<div class="state-viewer"></div>`;
}

export function setupStateViewer() {
  const updateView = () => {
    const stateViewer = document.querySelector<HTMLDivElement>(".state-viewer");
    const state = globalState.getState();
    if (stateViewer) {
      stateViewer.innerHTML = `
        <div>Dodgeball ${state.dodgeball ? "initialized" : "not initialized"}</div>
        <div>Submit Button Action: ${state.submitButtonAction}</div>
        <div>Session ID: ${state.sessionId ?? "No session ID"}</div>
        <div>User ID: ${state.userId ?? "No user ID"}</div>
        <div>Checkpoint Name: ${state.checkpointName}</div>
        <div>Checkpoint Payload: ${JSON.stringify(state.checkpointPayload)}</div>
        <div>Checkpoint Payload is Valid: ${state.checkpointPayloadIsValid ? "Yes" : "No"}</div>
        <div>Server Event Name: ${state.serverEventName}</div>
        <div>Server Event Payload: ${JSON.stringify(state.serverEventPayload)}</div>
        <div>Server Event Payload is Valid: ${state.serverEventPayloadIsValid ? "Yes" : "No"}</div>
        <div>Message Count: ${state.messages.length}</div>
      `;
    }
  };

  globalState.subscribe("stateViewer", () => {
    console.log("State viewer updated");
    updateView();
  });

  updateView();
}
