import { CartSheet } from "@/components/custom/cart-sheet";
import { MainNav } from "@/components/custom/main-nav";
import type { Metadata } from "next";
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
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-end mb-4">
                    <CartSheet />
                  </div>
                  {children}
                </div>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
