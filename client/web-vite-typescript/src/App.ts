import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";
import { createEventOrCheckpointForm, setupCreateEventOrCheckpointForm } from "./components/EventOrCheckpointForm";
import { createHeader } from "./components/Header";
import { createMessagesContainer, setupMessagesContainer } from "./components/MessagesContainer";
import { createStateViewer, setupStateViewer } from "./components/StateViewer";
import { createSubmitButton, setupSubmitButton } from "./components/SubmitButton";
import { createUserSelector, setupUserSelector } from "./components/UserSelector";
import globalState from "./state";

export function createApp() {
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  // Load environment variables from .env file
  // Feel free to use your preferred method of loading environment variables
  const dodgeballPublicApiKey = import.meta.env.VITE_DODGEBALL_PUBLIC_API_KEY ?? "UNSET_PUBLIC_API_KEY";
  const dodgeballApiUrl = import.meta.env.VITE_DODGEBALL_API_URL;

  const dodgeball = new Dodgeball(dodgeballPublicApiKey, {
    apiUrl: dodgeballApiUrl,
    apiVersion: DodgeballApiVersion.v1,
  });

  globalState.setDodgeball(dodgeball);

  if (!appDiv) return;

  appDiv.innerHTML = `
    ${createHeader({ apiUrl: dodgeballApiUrl })}
    <div class="container">
      <div class="left-column">
        ${createEventOrCheckpointForm()}
      </div>
      <div class="right-column">
        ${createUserSelector()}
      </div>
    </div>
    <div class="container">${createSubmitButton()}</div>
    <div class="container">${createMessagesContainer()}</div>
    <div class="container">${createStateViewer()}</div>
    
  `;

  setupStateViewer();
  setupUserSelector();
  setupSubmitButton();
  setupCreateEventOrCheckpointForm();
  setupMessagesContainer();
}
