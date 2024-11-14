"use client";

import { useState } from "react";
import { useDodgeballProvider } from "../contexts/DodgeballProvider";

export const ClientComponentExample = () => {
  const [newSourceToken, setNewSourceToken] = useState<string | null>(null);
  const { dodgeball, sourceToken } = useDodgeballProvider();

  const getNewSourceToken = async () => {
    if (!dodgeball) {
      console.log("dodgeball not initialized yet");
      return;
    }
    const newSourceToken = await dodgeball.getSourceToken();
    console.log("newSourceToken", newSourceToken);
    setNewSourceToken(newSourceToken);
  };

  return (
    <div>
      <h1>Hello Dodgeball</h1>
      <p>{!!dodgeball ? "Dodgeball Initialized" : "Dodgeball Not Initialized"}</p>
      <p>Source Token: {sourceToken}</p>
      <p>Source Token on demand: {newSourceToken}</p>
      <button style={{ border: "1px solid black", padding: "10px" }} onClick={getNewSourceToken}>
        Get New Source Token
      </button>
    </div>
  );
};
