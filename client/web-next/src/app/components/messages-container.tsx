"use client";

import { FC } from "react";
import dodgeballGlobalState from "../helpers/state";

export const MessagesContainer: FC = () => {
  return (
    <div id="messages-container">
      <div>Messages</div>
      <ul id="messages-list">{dodgeballGlobalState.getMessages().map((message) => <li key={message.message}>{message.message}</li>)}</ul>
    </div>
  )
};
