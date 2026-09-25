"use client";

import { ConversionHistory } from "@/components/history/list";
import { useAppHref } from "@/components/layout/app-shell";
import { LiveRates } from "@/components/rates/live";
import { WalletOverview } from "@/components/wallet/overview";
import { ROUTES } from "@/constants/routes";

export default function OverviewPage() {
  const goTo = useAppHref();

  return (
    <div className="space-y-6">
      <WalletOverview onStartConversion={() => goTo(ROUTES.convert)} />
      <div className="space-y-6">
        <LiveRates isPreview onViewAll={() => goTo(ROUTES.rates)} />
        <ConversionHistory
          isPreview
          onViewAll={() => goTo(ROUTES.transactions)}
        />
      </div>
    </div>
  );
}
