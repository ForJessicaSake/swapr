import { Suspense, type ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function WalletLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
