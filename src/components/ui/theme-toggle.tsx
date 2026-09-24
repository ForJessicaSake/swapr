"use client";

import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/hooks/use-theme";
import { classNames } from "@/utils/class-names";

export function ThemeToggle({
  appearance = "header",
}: {
  appearance?: "header" | "sidebar";
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const nextLabel = isDark ? "Light" : "Dark";

  if (appearance === "sidebar") {
    return (
      <button
        aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
        className="nav-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/50"
        onClick={toggleTheme}
        type="button"
      >
        <Icon name={isDark ? "sun" : "moon"} size={18} />
        {nextLabel}
      </button>
    );
  }

  return (
    <button
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors duration-200 hover:text-blue",
      )}
      onClick={toggleTheme}
      type="button"
    >
      <Icon name={isDark ? "sun" : "moon"} size={15} />
      {nextLabel}
    </button>
  );
}
