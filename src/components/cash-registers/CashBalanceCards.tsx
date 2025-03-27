
import { Card } from "@/components/ui/card";
import { Wallet, ShoppingCart, CreditCard, PiggyBank } from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface CashBalanceCardsProps {
  currentAmount: number;
  todayTotalSales: number;
  isLoading: boolean;
}

export function CashBalanceCards({ currentAmount, todayTotalSales, isLoading }: CashBalanceCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 bg-blue-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            <div className="text-sm">Fond de caisse actuel</div>
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <span className="opacity-70">Chargement...</span>
            ) : (
              formatGNF(currentAmount || 0)
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-orange-400 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Encaissement du jour</div>
              <div className="text-xs opacity-80">
                Inclut ventes, règlements factures et entrées
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShoppingCart className="h-5 w-5" />
              <CreditCard className="h-5 w-5" />
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <span className="opacity-70">Chargement...</span>
            ) : (
              formatGNF(todayTotalSales)
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
