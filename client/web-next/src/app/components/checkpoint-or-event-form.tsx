"use client";
import { FC, useMemo } from "react";
import { useCheckpointStateContext } from "../contexts/CheckpointStateProvider";

export const CheckpointOrEventForm: FC = () => {
  const { currentCheckpointState, updateCheckpointState, setCheckpointOrEventPayload } = useCheckpointStateContext();

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCheckpointOrEventPayload(e.target.value);
  };

  const handlePayloadBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const payload = e.target.value;
    try {
      const parsedPayload = JSON.parse(payload);
      const prettyPayload = JSON.stringify(parsedPayload, null, 2);
      setCheckpointOrEventPayload(prettyPayload);
    } catch (error) {
      console.warn("Not Pretty Formatting Payload due to inability to parse");
    }
  };

  const handleCheckpointNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCheckpointState.submitButtonAction === "checkpoint") {
      updateCheckpointState({ checkpointName: e.target.value });
    } else if (currentCheckpointState.submitButtonAction === "event") {
      updateCheckpointState({ serverEventName: e.target.value });
    }
  };

  const payloadValue = useMemo(() => {
    if (currentCheckpointState.submitButtonAction === "checkpoint") {
      return currentCheckpointState.rawCheckpointPayload ?? "";
    } else if (currentCheckpointState.submitButtonAction === "event") {
      return currentCheckpointState.rawServerEventPayload ?? "";
    }
  }, [currentCheckpointState]);

  const checkpointOrEventName = useMemo(() => {
    if (currentCheckpointState.submitButtonAction === "checkpoint") {
      return currentCheckpointState.checkpointName;
    } else if (currentCheckpointState.submitButtonAction === "event") {
      return currentCheckpointState.serverEventName;
    }
  }, [currentCheckpointState]);

  const fieldLabel = useMemo(() => {
    if (currentCheckpointState.submitButtonAction === "checkpoint") {
      return "Checkpoint";
    } else if (currentCheckpointState.submitButtonAction === "event") {
      return "Server Event";
    }
  }, [currentCheckpointState]);

  return (
    <div>
      <div className="tabs-container">
        <div className={`tab ${currentCheckpointState.submitButtonAction === "checkpoint" ? "tab-active": ""}`} onClick={() => updateCheckpointState({ submitButtonAction: "checkpoint" })}>Call a Checkpoint</div>
        <div className={`tab ${currentCheckpointState.submitButtonAction === "event" ? "tab-active": ""}`} onClick={() => updateCheckpointState({ submitButtonAction: "event" })}>Send a Server Event</div>
      </div>
      <div className="field-group">
        <div className="field-label"><label htmlFor="checkpoint-name">{fieldLabel} Name</label></div>
        <input onChange={handleCheckpointNameChange} className="field-checkpoint-name-input" name="checkpoint-name" type="text" placeholder="e.g. PAYMENT" value={checkpointOrEventName ?? "UNSET"} />
      </div>
      <div className="field-group">
        <div className="field-label"><div>{fieldLabel} Payload</div></div>
        <textarea onChange={handlePayloadChange} onBlur={handlePayloadBlur} className="payload-input" name="checkpoint-payload" rows={4} cols={20} value={payloadValue}></textarea>
      </div>
    </div>
  );
};
