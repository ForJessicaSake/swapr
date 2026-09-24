"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function DebugPanel() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  if (searchParams.get("debug") !== "1") {
    return null;
  }

  return (
    <aside
      aria-label="Reviewer tools"
      className="fixed right-4 bottom-20 z-40 lg:bottom-5"
    >
      {open && (
        <div className="mb-3 w-[290px] rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Reviewer tools
              </h2>
              <p className="mt-1 text-[11px] text-muted">
                APIs will be wired back in a later commit.
              </p>
            </div>
            <Button
              aria-label="Close reviewer tools"
              className="size-8 min-h-0 border-0"
              onClick={() => setOpen(false)}
              variant="icon"
            >
              <Icon name="close" size={17} />
            </Button>
          </div>
        </div>
      )}
      <Button
        className="rounded-full shadow-lg"
        onClick={() => setOpen((value) => !value)}
        size="sm"
        variant="ink"
      >
        <Icon name="info" size={15} />
        Reviewer tools
      </Button>
    </aside>
  );
}
