"use client";

import { useState } from "react";
import { useDodgeballProvider } from "../contexts/DodgeballProvider";

interface ClientComponentExampleProps {
  title: string;
}
export const ClientComponentExample = ({ title }: ClientComponentExampleProps) => {
  const [onDemandSourceToken, setOnDemandSourceToken] = useState<string | null>(null);
  const [onDemandSourceTokenLastUpdated, setOnDemandSourceTokenLastUpdated] = useState<Date | null>(null);
  const { dodgeball, sourceToken } = useDodgeballProvider();

  const getSourceTokenOnDemand = async () => {
    if (!dodgeball) {
      console.log("dodgeball not initialized yet");
      return;
    }
    const newSourceToken = await dodgeball.getSourceToken();
    console.log("onDemandSourceToken", newSourceToken);
    setOnDemandSourceToken(newSourceToken);
    setOnDemandSourceTokenLastUpdated(new Date());
  };

  return (
    <div className="border bg-gray-200 p-4 flex flex-col gap-2">
      <h1>{title}</h1>
      <p>{!!dodgeball ? "Dodgeball Initialized" : "Dodgeball Not Initialized"}</p>
      <p>Source Token: {sourceToken}</p>
      <p>Source Token on Demand: {onDemandSourceToken}</p>
      <p>Source Token on Demand last updated: {onDemandSourceTokenLastUpdated?.toLocaleString()}</p>
      <button className="border border-black rounded max-w-fit p-2 bg-gray-300 hover:bg-gray-400" onClick={getSourceTokenOnDemand}>
        Get Source Token on Demand
      </button>
    </div>
  );
};
