"use client";
import { FC } from "react";

interface PageHeaderProps {
  apiUrl: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ apiUrl }) => {
  return (<div className="header-container">
    <p>Dodgeball API: {apiUrl ?? "Default"}</p>
    <p>This example is built using the Dodgeball Client SDK. You can use it to call checkpoints on your Dodgeball account and pass in arbitrary event data. Use it to experiment!</p>
  </div>)
};

