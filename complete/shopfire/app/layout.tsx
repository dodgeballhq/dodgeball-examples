import { MainNav } from "@/components/custom/main-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SHOPFIRE",
  description: "Dodgeball + Finance",
  icons: {
    icon: ["/favicon.svg", "/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex">
            <MainNav />
            <main className="flex-1">
              <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
                <ScrollArea className="h-[calc(100vh-4rem)]">
                  <div className="max-w-4xl mx-auto">{children}</div>
                </ScrollArea>
              </div>
            </main>
          </div>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
