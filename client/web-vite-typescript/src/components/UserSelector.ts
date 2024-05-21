import globalState from "../state";
import { nanoid } from "nanoid";

export function createUserSelector(): string {
  return `
    <div>
      <div class="user-selector-title">Select a User and Session Option:</div>
      <div class="user-item-container">
        <label>
          <div class="field-label">Use a Custom User:</div>
          <input class="field-text-input" type="text" id="user-id-input" placeholder="Enter a specific User ID">
        </label>
      </div>
      <div class="user-item-container">
        <div class="user-session-list">
          <div class="session-selector-title">Choose a Session ID</div>
          <input class="field-text-input" type="text" id="session-id-input" placeholder="Enter Session ID">
          <div class="add-button-container"><button id="new-anonymous-session-btn">New Anonymous Session</button></div>
        </div>
      </div>
      <div class="add-button-container"><button id="new-user-btn">New User</button></div>
    </div>
  `;
}

export function setupUserSelector() {
  const userIdInput = document.getElementById("user-id-input") as HTMLInputElement;
  const sessionIdInput = document.getElementById("session-id-input") as HTMLInputElement;

  if (userIdInput) {
    userIdInput.addEventListener("blur", () => {
      globalState.setSessionUser(globalState.getSessionId(), userIdInput.value);
    });
  }

  if (sessionIdInput) {
    sessionIdInput.addEventListener("blur", () => {
      globalState.setSessionUser(sessionIdInput.value, globalState.getUserId());
    });
  }

  const newUserBtn = document.getElementById("new-user-btn");
  if (newUserBtn) {
    newUserBtn.addEventListener("click", () => {
      const newUserId = "user-" + nanoid();
      const newSessionId = "sess-" + nanoid();
      globalState.setSessionUser(newSessionId, newUserId);
      if (userIdInput) userIdInput.value = newUserId;
      if (sessionIdInput) sessionIdInput.value = newSessionId;
    });
  }

  const newAnonymousSessionBtn = document.getElementById("new-anonymous-session-btn");
  if (newAnonymousSessionBtn) {
    newAnonymousSessionBtn.addEventListener("click", () => {
      const newSessionId = "anon-sess-" + nanoid();
      globalState.setSessionUser(newSessionId, null);
      if (sessionIdInput) sessionIdInput.value = newSessionId;
      if (userIdInput) userIdInput.value = "";
    });
  }

  newUserBtn?.click();
}
