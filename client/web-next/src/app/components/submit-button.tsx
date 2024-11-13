"use client";

import { FC } from "react";
import { IProcessDodgeballCheckpointApiParams, processCheckpoint } from "../helpers/dodgeball-actions";
import globalDodgeballState from "../helpers/state";
export const SubmitButton: FC = () => {
  const getCorrectInnerText = (action: string) => {
    return action === "checkpoint" ? "Call Checkpoint" : "Send Server Event";
  };

  const handleSubmit = async () => {
    globalDodgeballState.clearMessages();
    const checkpointName = globalDodgeballState.getCheckpointName();
    globalDodgeballState.addMessage("processCheckpoint called for checkpoint: " + checkpointName);
    const processCheckpointApiParams: IProcessDodgeballCheckpointApiParams = {
      checkpointName,
      payload: globalDodgeballState.getCheckpointPayload(),
      sessionId: globalDodgeballState.getSessionId() ?? undefined,
      userId: globalDodgeballState.getUserId() ?? undefined,
    };
    await processCheckpoint(processCheckpointApiParams);
  };

  return (
    <>
      <div className="submit-button-container">
        <button id="submit" onClick={handleSubmit}>{getCorrectInnerText(globalDodgeballState.getSubmitButtonAction())}</button>
      </div>
      <div className="submit-button-messages"></div>
    </>
  )
};
