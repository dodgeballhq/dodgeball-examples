import globalState from "../state";

export const createEventOrCheckpointForm = () => {
  return `
  <div class="tabs-container">
          <div class="tab tab-active">Call a Checkpoint</div>
          <div class="tab tab-inactive">Send a Server Event</div>
        </div>
  <div class="field-group">
          <div class="field-label"><label for="checkpoint-name">Checkpoint Name</label></div>
          <input class="field-checkpoint-name-input" name="checkpoint-name" type="text" placeholder="e.g. PAYMENT" value="">
        </div>
        <div class="field-group">
          <div class="field-label"><label for="checkpoint-payload">Checkpoint Payload</label></div>
          <textarea class="payload-input" name="checkpoint-payload" rows="4" cols="20">{
  "example": "payload"
}</textarea>
        </div>
        `;
};

export const setupCreateEventOrCheckpointForm = () => {
  const tabs = document.querySelectorAll(".tab");
  const nameInput = document.querySelector(".field-checkpoint-name-input");
  const payloadInput = document.querySelector(".payload-input");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      globalState.clearMessages();
      const currentTab = tab;
      const currentActionText = currentTab.innerHTML;
      if (currentActionText === "Call a Checkpoint") {
        console.log("Call a Checkpoint tab clicked");
        globalState.setSubmitButtonAction("checkpoint");
      } else if (currentActionText === "Send a Server Event") {
        console.log("Send a Server Event tab clicked");
        globalState.setSubmitButtonAction("event");
      }
      // Update classes for tabs
      tabs.forEach((t) => {
        if (currentTab === t) {
          t.classList.add("tab-active");
        } else {
          t.classList.remove("tab-active");
          t.classList.add("tab-inactive");
        }
      });
    });
  });

  const handleNameInputChange = (newValue: string) => {
    const action = globalState.getSubmitButtonAction();
    if (action === "checkpoint") {
      globalState.setCheckpointName(newValue);
    } else {
      globalState.setServerEventName(newValue);
    }
  };

  const handlePayloadInputChange = (newValue: string) => {
    const action = globalState.getSubmitButtonAction();
    if (action === "checkpoint") {
      globalState.setCheckpointPayload(newValue);
    } else {
      globalState.setServerEventPayload(newValue);
    }
  };

  if (nameInput && nameInput instanceof HTMLInputElement) {
    nameInput.addEventListener("blur", () => {
      handleNameInputChange(nameInput.value);
    });
  }

  if (payloadInput && payloadInput instanceof HTMLTextAreaElement) {
    payloadInput.addEventListener("blur", () => {
      handlePayloadInputChange(payloadInput.value);
    });
  }

  const updateView = () => {
    const action = globalState.getSubmitButtonAction();
    if (nameInput && nameInput instanceof HTMLInputElement) {
      nameInput.value = action === "checkpoint" ? globalState.getCheckpointName() : globalState.getServerEventName();
    }
    if (payloadInput && payloadInput instanceof HTMLTextAreaElement) {
      if (action === "checkpoint" && globalState.getCheckpointPayloadIsValid()) {
        payloadInput.value = JSON.stringify(globalState.getCheckpointPayload(), null, 2);
      } else if (action === "event" && globalState.getServerEventPayloadIsValid()) {
        payloadInput.value = JSON.stringify(globalState.getServerEventPayload(), null, 2);
      }
    }
  };

  globalState.subscribe("createEventOrCheckpointForm", () => {
    updateView();
  });

  updateView();
};
