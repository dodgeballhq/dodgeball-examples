import { FC } from "react";

export const UserSelector: FC = () => {
  return (
    <div>
      <div className="user-selector-title">Select a User and Session Option:</div>
      <div className="user-item-container">
        <label>
          <div className="field-label">Use a Custom User:</div>
          <input className="field-text-input" type="text" id="user-id-input" placeholder="Enter a specific User ID" />
        </label>
      </div>
      <div className="user-item-container">
        <div className="user-session-list">
          <div className="session-selector-title">Choose a Session ID</div>
          <input className="field-text-input" type="text" id="session-id-input" placeholder="Enter Session ID" />
          <div className="add-button-container"><button id="new-anonymous-session-btn">New Anonymous Session</button></div>
        </div>
      </div>
      <div className="add-button-container"><button id="new-user-btn">New User</button></div>
    </div>
  )
};
