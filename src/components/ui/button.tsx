"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

import { classNames } from "@/utils/class-names";

type ButtonVariant = "primary" | "secondary" | "ink" | "ghost" | "icon";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-blue text-white shadow-[0_1px_0_rgb(16_24_40_/_6%)] hover:bg-blue-dark hover:shadow-[0_8px_18px_rgb(49_87_213_/_22%)] disabled:bg-blue-soft disabled:text-muted disabled:shadow-none",
  secondary:
    "border border-line bg-surface text-ink-soft hover:border-blue/30 hover:bg-surface-muted hover:shadow-[0_6px_14px_rgb(16_24_40_/_6%)]",
  ink: "bg-ink text-canvas hover:opacity-90 disabled:bg-muted disabled:shadow-none",
  ghost: "text-blue hover:translate-y-0 hover:text-blue-dark",
  icon: "border border-line bg-surface text-ink-soft hover:border-blue/30 hover:bg-surface-muted hover:text-blue",
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        className={classNames(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          BUTTON_VARIANT_CLASS[variant],
          variant === "icon" ? "size-9 min-h-0 p-0" : BUTTON_SIZE_CLASS[size],
          variant === "ghost" && "min-h-0 px-0",
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
