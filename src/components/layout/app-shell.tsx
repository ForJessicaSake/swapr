"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  hrefWithDebug,
  ROUTES,
  screenFromPathname,
  type AppScreen,
} from "@/constants/routes";
import { classNames } from "@/utils/class-names";

const NAV_ITEMS: Array<{
  id: AppScreen;
  href: string;
  label: string;
  icon: IconName;
  group: string;
}> = [
  {
    id: "overview",
    href: ROUTES.overview,
    label: "Overview",
    icon: "home",
    group: "Wallet",
  },
  {
    id: "convert",
    href: ROUTES.convert,
    label: "Convert",
    icon: "swap",
    group: "Exchange",
  },
  {
    id: "rates",
    href: ROUTES.rates,
    label: "Live rates",
    icon: "activity",
    group: "Exchange",
  },
  {
    id: "transactions",
    href: ROUTES.transactions,
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

const NAV_GROUPS = ["Wallet", "Exchange", "Records"];

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

function SidebarNav({
  activeScreen,
  hrefFor,
  onNavigate,
}: {
  activeScreen: AppScreen;
  hrefFor: (path: string) => string;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="px-2">
        <Link href={hrefFor(ROUTES.overview)} onClick={onNavigate}>
          <SwaprLogo />
        </Link>
      </div>

      <nav aria-label="Primary navigation" className="mt-10 flex-1">
        {NAV_GROUPS.map((group) => (
          <div className="mb-7" key={group}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.12em] text-white/35 uppercase">
              {group}
            </p>
            <div className="space-y-1">
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => (
                <Link
                  className={classNames(
                    "nav-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium",
                    activeScreen === item.id
                      ? "is-active bg-white/10 text-white shadow-[inset_3px_0_0_var(--blue)]"
                      : "text-white/50",
                  )}
                  href={hrefFor(item.href)}
                  key={item.id}
                  onClick={onNavigate}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <ThemeToggle appearance="sidebar" />
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const menuId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeScreen = screenFromPathname(pathname);
  const hrefFor = (path: string) =>
    hrefWithDebug(path, searchParams.get("debug"));

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const copy = SCREEN_COPY[activeScreen];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-nav px-4 py-6 lg:flex">
        <SidebarNav
          activeScreen={activeScreen}
          hrefFor={hrefFor}
          onNavigate={closeMenu}
        />
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/50"
            onClick={closeMenu}
            type="button"
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[min(248px,86vw)] flex-col bg-nav px-4 py-6 shadow-2xl"
            id={menuId}
          >
            <div className="mb-2 flex justify-end">
              <Button
                aria-label="Close menu"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={closeMenu}
                variant="icon"
              >
                <Icon name="close" size={17} />
              </Button>
            </div>
            <SidebarNav
              activeScreen={activeScreen}
              hrefFor={hrefFor}
              onNavigate={closeMenu}
            />
          </aside>
        </div>
      )}

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
          <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <Button
                aria-controls={menuId}
                aria-expanded={isMenuOpen}
                aria-label="Open menu"
                onClick={() => setIsMenuOpen(true)}
                variant="icon"
              >
                <Icon name="menu" size={18} />
              </Button>
              <SwaprLogo onLight />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold tracking-[-0.025em] text-ink">
                {copy.title}
              </h1>
              <p className="mt-0.5 text-xs text-ink-soft">{copy.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div aria-label="John Doe" className="flex items-center gap-2.5">
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

        <main className="mx-auto max-w-[1360px] px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{copy.description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function useAppHref() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug");

  return (path: string) => {
    router.push(hrefWithDebug(path, debug));
  };
}
