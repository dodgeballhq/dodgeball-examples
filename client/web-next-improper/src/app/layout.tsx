import type { Metadata } from "next";
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
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
