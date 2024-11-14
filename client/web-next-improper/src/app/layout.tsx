import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Improper | Dodgeball Examples | Client",
  description: "This example demonstrates how to use the Dodgeball Client SDK with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
