"use client";
import { FC } from "react";
import dodgeballGlobalState from "../helpers/state";

export const CheckpointOrEventForm: FC = () => {
  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dodgeballGlobalState.setCheckpointPayload(e.target.value);
  };

  const handleCheckpointNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dodgeballGlobalState.setCheckpointName(e.target.value);
  };

  return (
    <>
    <div className="tabs-container">
      <div className="tab tab-active">Call a Checkpoint</div>
      <div className="tab tab-inactive">Send a Server Event</div>
</div>
      <div className="field-group">
        <div className="field-label"><label htmlFor="checkpoint-name">Checkpoint Name</label></div>
        <input onChange={handleCheckpointNameChange} className="field-checkpoint-name-input" name="checkpoint-name" type="text" placeholder="e.g. PAYMENT" defaultValue={dodgeballGlobalState.getCheckpointName()} />
      </div>
      <div className="field-group">
        <div className="field-label"><label htmlFor="checkpoint-payload">Checkpoint Payload</label></div>
        <textarea onChange={handlePayloadChange} className="payload-input" name="checkpoint-payload" rows={4} cols={20} defaultValue={JSON.stringify(dodgeballGlobalState.getCheckpointPayload())}></textarea>
      </div>
    </>
  );
};
