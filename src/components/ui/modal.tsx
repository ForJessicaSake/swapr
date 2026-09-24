"use client";

import { type ReactNode, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type ModalProps = {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
  titleId?: string;
  eyebrow?: ReactNode;
};

export function Modal({
  children,
  eyebrow,
  footer,
  onClose,
  open,
  title,
  titleId = "modal-title",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-end bg-nav/35 backdrop-blur-[2px] sm:items-stretch"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="flex max-h-[92vh] w-full flex-col rounded-t-[24px] bg-surface shadow-2xl sm:max-h-none sm:max-w-[440px] sm:rounded-none">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <div>
            {eyebrow}
            <h2
              className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink"
              id={titleId}
            >
              {title}
            </h2>
          </div>
          <Button
            aria-label="Close"
            className="rounded-full border-0 bg-surface-muted"
            onClick={onClose}
            variant="icon"
          >
            <Icon name="close" size={18} />
          </Button>
        </div>
        <div className="subtle-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {children}
        </div>
        {footer && (
          <div className="border-t border-line p-5 sm:px-7">{footer}</div>
        )}
      </div>
    </div>
  );
}
