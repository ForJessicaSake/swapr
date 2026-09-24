"use client";

import {
  type InputHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { classNames } from "@/utils/class-names";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  action?: ReactNode;
  addon?: ReactNode;
  variant?: "default" | "ghost";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    action,
    addon,
    className,
    error,
    hint,
    id,
    label,
    variant = "default",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={classNames(variant === "default" ? "space-y-1.5" : undefined)}>
      {(label || action) && (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <label
              className="text-xs font-medium text-ink-soft"
              htmlFor={inputId}
            >
              {label}
            </label>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className={classNames(addon ? "flex items-center gap-3" : undefined)}>
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || undefined}
          className={classNames(
            "w-full appearance-none bg-transparent text-ink shadow-none outline-none placeholder:text-muted focus:outline-none focus-visible:outline-none",
            variant === "default"
              ? "min-h-11 rounded-xl border border-line px-3 text-sm focus:border-blue focus:ring-4 focus:ring-blue/10"
              : undefined,
            variant === "ghost"
              ? "money min-w-0 flex-1 text-2xl font-semibold"
              : undefined,
            className,
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {addon}
      </div>
      {error ? (
        <p className="text-[11px] text-red" id={`${inputId}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});

type ControlledInputProps<TFieldValues extends FieldValues> = Omit<
  InputProps,
  "name" | "defaultValue"
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export function ControlledInput<TFieldValues extends FieldValues>({
  control,
  name,
  ...props
}: ControlledInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          {...props}
          error={fieldState.error?.message ?? props.error}
          onChange={(event) => {
            if (props.onChange) {
              props.onChange(event);
              return;
            }
            field.onChange(event);
          }}
          value={props.value ?? field.value ?? ""}
        />
      )}
    />
  );
}
