import type { Metadata } from "next";
import { Suspense } from "react";

import { Providers } from "@/app/providers";
import { DebugPanel } from "@/components/debug/debug-panel";

import "./globals.css";

export const metadata: Metadata = {
  title: "Swapr",
  description: "Hold, track and swap currencies with confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('swapr-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
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
