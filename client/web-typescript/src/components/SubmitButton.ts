import { IProcessCheckpointApiParams, IProcessServerEventApiParams, processCheckpoint, sendServerEvent } from "../dodgeball-actions";
import globalState from "../state";

export function createSubmitButton(): string {
  return `
    <div class="submit-button-container"><button id="submit"></button></div>
    <div class="submit-button-messages"></div>
  `;
}

export function setupSubmitButton() {
  const submitButton = document.getElementById('submit') as HTMLButtonElement;
  const submitButtonMessages = document.querySelector('.submit-button-messages') as HTMLDivElement;

  const getCorrectInnerText = (action: string) => {
    return action === "checkpoint" ? "Call Checkpoint" : "Send Server Event";
  }

  const submitCheckpoint = async () => {
    globalState.clearMessages();
    const checkpointName = globalState.getCheckpointName();
    globalState.addMessage("processCheckpoint called for checkpoint: " + checkpointName);
    const processCheckpointApiParams: IProcessCheckpointApiParams = {
      checkpointName,
      payload: globalState.getCheckpointPayload(),
      sessionId: globalState.getSessionId() ?? undefined,
      userId: globalState.getUserId() ?? undefined,
    }
    await processCheckpoint(processCheckpointApiParams);
  }

  const submitEvent = async () => {
    globalState.clearMessages();
    const serverEventName = globalState.getServerEventName();
    globalState.addMessage("sendServerEvent called for event: " + serverEventName);
    const processServerEventApiParams: IProcessServerEventApiParams = {
      eventName: serverEventName,
      payload: globalState.getServerEventPayload(),
      sessionId: globalState.getSessionId() ?? undefined,
      userId: globalState.getUserId() ?? undefined,
    }
    await sendServerEvent(processServerEventApiParams)
  }

  if (submitButton) {
    const action = globalState.getSubmitButtonAction();
    submitButton.innerText = getCorrectInnerText(action);
    submitButton.addEventListener('click', async () => {
      const action = globalState.getSubmitButtonAction();
      switch (action) {
        case "checkpoint":
          await submitCheckpoint();
          break;
        case "event":
          await submitEvent();
          break;
      }
    });
  }

  const updateView = () => {
    const { dodgeball, sessionId, checkpointPayloadIsValid, serverEventPayloadIsValid, submitButtonAction } = globalState.getState();
    submitButton.innerText = getCorrectInnerText(submitButtonAction);
    const issues = [];
    if (!dodgeball) {
      issues.push("Dodgeball not initialized");
    }
    if (!sessionId) {
      issues.push("No session ID");
    }
    if (submitButtonAction === "checkpoint" && !checkpointPayloadIsValid) {
      issues.push("Invalid checkpoint payload");
    }
    if (submitButtonAction === "event" && !serverEventPayloadIsValid) {
      issues.push("Invalid server event payload");
    }
    if (issues.length) {
      if (submitButtonMessages) submitButtonMessages.innerHTML = issues.join(", ");
      submitButton.disabled = true;
    } else {
      if (submitButtonMessages) submitButtonMessages.innerHTML = "";
      submitButton.disabled = false;
    }
  }

  updateView();

  globalState.subscribe("submitButton", () => {
    updateView();
  });
}