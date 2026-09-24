"use client";

import {
  type ReactNode,
  type SelectHTMLAttributes,
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

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ children, className, id, label, ...props }, ref) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    const select = (
      <select
        className={classNames(
          "cursor-pointer appearance-none bg-transparent font-semibold text-ink outline-none focus:outline-none focus-visible:outline-none",
          className,
        )}
        id={selectId}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );

    if (!label) return select;

    return (
      <label
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-soft"
        htmlFor={selectId}
      >
        {label}
        {select}
      </label>
    );
  },
);

type ControlledSelectProps<TFieldValues extends FieldValues> = Omit<
  SelectProps,
  "name" | "defaultValue"
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export function ControlledSelect<TFieldValues extends FieldValues>({
  control,
  name,
  ...props
}: ControlledSelectProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          {...props}
          {...field}
          onChange={(event) => {
            field.onChange(event);
            props.onChange?.(event);
          }}
          value={field.value ?? ""}
        />
      )}
    />
  );
}
