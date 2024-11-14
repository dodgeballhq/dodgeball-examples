import type { Metadata } from "next";
import { CheckpointStateProvider } from "./contexts/CheckpointStateProvider";
import { DodgeballProvider } from "./contexts/DodgeballProvider";
import "./globals.css";
export const metadata: Metadata = {
  title: "Client/Next.js | Dodgeball Examples",
  description: "This example demonstrates how to use the Dodgeball Client SDK with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dodgeballPublicApiKey = process.env.NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY ?? "UNSET_PUBLIC_API_KEY";
  const dodgeballApiUrl = process.env.NEXT_PUBLIC_DODGEBALL_API_URL;
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <CheckpointStateProvider>
          <DodgeballProvider publicApiKey={dodgeballPublicApiKey} dodgeballApiUrl={dodgeballApiUrl}>
            {children}
          </DodgeballProvider>
        </CheckpointStateProvider>
      </body>
    </html>
  );
}
