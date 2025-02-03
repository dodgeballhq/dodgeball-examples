"use client";

import { FC, useMemo } from "react";
import { MessageColor, useCheckpointStateContext } from "../contexts/CheckpointStateProvider";

export const MessagesContainer: FC = () => {
  const { currentCheckpointState } = useCheckpointStateContext();
  const messages = useMemo(() => currentCheckpointState.messages, [currentCheckpointState]);
  return (
    <div id="messages-container">
      <div className="field-label">Messages</div>
      <ul id="messages-list">
        {messages.map((m: { message?: string, jsDate?: Date, color?: string }, mIndex) => 
          <li className="flex gap-2 border-b items-center font-mono" key={mIndex}>
            <div className="min-w-[95px] text-xs">{m.jsDate ? m.jsDate.toLocaleTimeString() : ""}:</div>
            <div className={`text-xs ${m.color ?? MessageColor.GREY}`}>{m.message}</div>
          </li>
        )}
      </ul>
    </div>
  )
};
