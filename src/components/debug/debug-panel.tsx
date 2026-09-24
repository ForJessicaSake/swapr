"use client";

import { useSearchParams } from "next/navigation";

export function DebugPanel() {
  const searchParams = useSearchParams();

  if (searchParams.get("debug") !== "1") {
    return null;
  }

  return (
    <aside aria-label="Debug panel" className="rounded border p-4">
      <h2 className="text-sm font-semibold">Debug</h2>
    </aside>
  );
}
