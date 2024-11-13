"use client";
import { FC, useState } from "react";

export const CheckpointOrEventForm: FC = () => {
  const [payload, setPayload] = useState('{"example": "payload"}');
  const [checkpointName, setCheckpointName] = useState("");
  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPayload(e.target.value);
  };

  const handleCheckpointNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckpointName(e.target.value);
  };

  return (
    <>
    <div className="tabs-container">
      <div className="tab tab-active">Call a Checkpoint</div>
      <div className="tab tab-inactive">Send a Server Event</div>
</div>
      <div className="field-group">
        <div className="field-label"><label htmlFor="checkpoint-name">Checkpoint Name</label></div>
        <input onChange={handleCheckpointNameChange} className="field-checkpoint-name-input" name="checkpoint-name" type="text" placeholder="e.g. PAYMENT" defaultValue="" />
      </div>
      <div className="field-group">
        <div className="field-label"><label htmlFor="checkpoint-payload">Checkpoint Payload</label></div>
        <textarea onChange={handlePayloadChange} className="payload-input" name="checkpoint-payload" rows={4} cols={20} defaultValue={'{"example": "payload"}'}></textarea>
      </div>
    </>
  );
};
