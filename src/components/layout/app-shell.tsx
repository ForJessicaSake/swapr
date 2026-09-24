"use client";

import { useEffect, useState } from "react";

import { ConvertForm } from "@/components/convert/form";
import { ConversionHistory } from "@/components/history/list";
import { LiveRates } from "@/components/rates/live";
import { Icon, type IconName } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { WalletOverview } from "@/components/wallet/overview";
import { classNames } from "@/utils/class-names";

type AppScreen = "overview" | "convert" | "rates" | "transactions";

const NAV_ITEMS: Array<{
  id: AppScreen;
  label: string;
  icon: IconName;
  group: string;
}> = [
  { id: "overview", label: "Overview", icon: "home", group: "Wallet" },
  { id: "convert", label: "Convert", icon: "swap", group: "Exchange" },
  { id: "rates", label: "Live rates", icon: "activity", group: "Exchange" },
  {
    id: "transactions",
    label: "Transactions",
    icon: "history",
    group: "Records",
  },
];

const SCREEN_COPY: Record<AppScreen, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description: "Your money, across every currency.",
  },
  convert: {
    title: "Convert",
    description: "Lock a rate for 30 seconds and swap with certainty.",
  },
  rates: {
    title: "Live rates",
    description: "Current rates across your wallet currencies.",
  },
  transactions: {
    title: "Transactions",
    description: "Every completed conversion, in one place.",
  },
};

function SwaprLogo({ onLight = false }: { onLight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-[13px] bg-blue text-white shadow-[0_8px_24px_rgba(49,87,213,.25)]">
        <Icon name="swap" size={22} />
      </div>
      <div>
        <div
          className={classNames(
            "text-[19px] font-semibold tracking-[-0.04em]",
            onLight ? "text-ink" : "text-white",
          )}
        >
          swapr
        </div>
        <div
          className={classNames(
            "text-[11px] font-medium tracking-[0.08em] uppercase",
            onLight ? "text-muted" : "text-white/50",
          )}
        >
          FX wallet
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>("overview");

  useEffect(() => {
    const syncHash = () => {
      const nextScreen = window.location.hash.slice(1) as AppScreen;
      if (NAV_ITEMS.some((item) => item.id === nextScreen)) {
        setActiveScreen(nextScreen);
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const navigateToScreen = (nextScreen: AppScreen) => {
    setActiveScreen(nextScreen);
    window.history.replaceState(null, "", `#${nextScreen}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navGroups = ["Wallet", "Exchange", "Records"];
  const copy = SCREEN_COPY[activeScreen];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-nav px-4 py-6 lg:flex">
        <div className="px-2">
          <SwaprLogo />
        </div>

        <nav aria-label="Primary navigation" className="mt-10 flex-1">
          {navGroups.map((group) => (
            <div className="mb-7" key={group}>
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                {group}
              </p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((item) => item.group === group).map(
                  (item) => (
                    <button
                      className={classNames(
                        "nav-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium",
                        activeScreen === item.id
                          ? "is-active bg-white/10 text-white shadow-[inset_3px_0_0_var(--blue)]"
                          : "text-white/50",
                      )}
                      key={item.id}
                      onClick={() => navigateToScreen(item.id)}
                      type="button"
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <ThemeToggle appearance="sidebar" />
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
          <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <SwaprLogo onLight />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold tracking-[-0.025em] text-ink">
                {copy.title}
              </h1>
              <p className="mt-0.5 text-xs text-ink-soft">{copy.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
              <div
                aria-label="John Doe"
                className="flex items-center gap-2.5"
              >
                <div
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-full bg-blue text-[11px] font-semibold text-white"
                >
                  JD
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold text-ink">John Doe</p>
                  <p className="text-[11px] text-muted">Personal wallet</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1360px] px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10">
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{copy.description}</p>
          </div>

          {activeScreen === "overview" && (
            <div className="space-y-6">
              <WalletOverview
                onStartConversion={() => navigateToScreen("convert")}
              />
              <div className="space-y-6">
                <LiveRates
                  isPreview
                  onViewAll={() => navigateToScreen("rates")}
                />
                <ConversionHistory
                  isPreview
                  onViewAll={() => navigateToScreen("transactions")}
                />
              </div>
            </div>
          )}
          {activeScreen === "convert" && <ConvertForm />}
          {activeScreen === "rates" && <LiveRates />}
          {activeScreen === "transactions" && <ConversionHistory />}
        </main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface px-2 pb-[max(8px,env(safe-area-inset-bottom))] lg:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <button
            className={classNames(
              "flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-200 ease-out",
              activeScreen === item.id ? "text-blue" : "text-muted hover:text-blue",
            )}
            key={item.id}
            onClick={() => navigateToScreen(item.id)}
            type="button"
          >
            <Icon
              name={item.icon}
              size={20}
              strokeWidth={activeScreen === item.id ? 2.2 : 1.8}
            />
            {item.label === "Transactions" ? "Activity" : item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
