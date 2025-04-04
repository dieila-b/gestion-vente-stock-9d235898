
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatGNF } from "@/lib/currency";

interface FinancialSituationProps {
  creditBalance: number;
  debitBalance: number;
  netBalance: number;
}

export function FinancialSituation({
  creditBalance,
  debitBalance,
  netBalance
}: FinancialSituationProps) {
  return (
    <Card className="p-6 enhanced-glass">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gradient">Situation actuelle</h2>
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Solde Avoir :</span>
            <span className="font-medium">{formatGNF(creditBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Solde Devoir :</span>
            <span className="font-medium">{formatGNF(debitBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Situation normale :</span>
            <span className="font-medium">{formatGNF(netBalance)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
