
import React from 'react';
import { formatGNF } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { PeriodTotals } from "../hooks/types";

interface SalesTotalsProps {
  periodTotals: PeriodTotals;
}

export function SalesTotals({ periodTotals }: SalesTotalsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 bg-white/5">
        <div className="text-sm text-muted-foreground">Total des ventes</div>
        <div className="text-2xl font-bold">{formatGNF(periodTotals?.total || 0)}</div>
      </Card>
      <Card className="p-4 bg-white/5">
        <div className="text-sm text-muted-foreground">Montant encaissé</div>
        <div className="text-2xl font-bold text-green-500">{formatGNF(periodTotals?.paid || 0)}</div>
      </Card>
      <Card className="p-4 bg-white/5">
        <div className="text-sm text-muted-foreground">Reste à payer</div>
        <div className="text-2xl font-bold text-yellow-500">{formatGNF(periodTotals?.remaining || 0)}</div>
      </Card>
    </div>
  );
}
