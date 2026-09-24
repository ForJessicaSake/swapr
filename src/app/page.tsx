import { ConvertForm } from "@/components/convert/convert-form";
import { TransactionHistory } from "@/components/history/transaction-history";
import { RatesBoard } from "@/components/rates/rates-board";
import { WalletOverview } from "@/components/wallet/wallet-overview";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Swapr</h1>
      </header>
      <WalletOverview />
      <RatesBoard />
      <ConvertForm />
      <TransactionHistory />
    </main>
  );
}
