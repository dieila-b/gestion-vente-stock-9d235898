
import React from 'react';
import { formatGNF } from "@/lib/currency";

interface CustomSalesTotalsProps {
  periodTotals?: {
    total: number;
    paid: number;
    remaining: number;
  };
}

export function CustomSalesTotals({ periodTotals }: CustomSalesTotalsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Total des ventes</div>
        <div className="text-2xl font-bold">{formatGNF(periodTotals?.total || 0)}</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Montant encaissé</div>
        <div className="text-2xl font-bold text-green-500">{formatGNF(periodTotals?.paid || 0)}</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Reste à payer</div>
        <div className="text-2xl font-bold text-yellow-500">{formatGNF(periodTotals?.remaining || 0)}</div>
      </div>
    </div>
  );
}
