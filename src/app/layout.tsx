import type { Metadata } from "next";
import { Suspense } from "react";

import { Providers } from "@/app/providers";
import { DebugPanel } from "@/components/debug/debug-panel";

import "./globals.css";

export const metadata: Metadata = {
  title: "Swapr",
  description: "Multi-currency FX wallet",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <Providers>
          {children}
          <Suspense fallback={null}>
            <DebugPanel />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
