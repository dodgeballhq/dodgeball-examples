"use client";

import { FC } from "react";
import { IProcessDodgeballCheckpointApiParams, processCheckpoint } from "../helpers/dodgeball-actions";
import dodgeballGlobalState from "../helpers/state";
export const SubmitButton: FC = () => {
  const getCorrectInnerText = (action: string) => {
    return action === "checkpoint" ? "Call Checkpoint" : "Send Server Event";
  };

  const handleSubmit = async () => {
    dodgeballGlobalState.clearMessages();
    const checkpointName = dodgeballGlobalState.getCheckpointName();
    dodgeballGlobalState.addMessage("processCheckpoint called for checkpoint: " + checkpointName);
    const processCheckpointApiParams: IProcessDodgeballCheckpointApiParams = {
      checkpointName,
      payload: dodgeballGlobalState.getCheckpointPayload(),
      sessionId: dodgeballGlobalState.getSessionId() ?? undefined,
      userId: dodgeballGlobalState.getUserId() ?? undefined,
    };
    await processCheckpoint(processCheckpointApiParams);
  };

  return (
    <>
      <div className="submit-button-container">
        <button id="submit" onClick={handleSubmit}>{getCorrectInnerText(dodgeballGlobalState.getSubmitButtonAction())}</button>
      </div>
      <div className="submit-button-messages"></div>
    </>
  )
};
