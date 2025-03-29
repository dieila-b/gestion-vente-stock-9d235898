
import { formatGNF } from "@/lib/currency";

interface ClientReportSummaryProps {
  totals: {
    total: number;
    paid: number;
    remaining: number;
  };
}

export function ClientReportSummary({ totals }: ClientReportSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Total des ventes</div>
        <div className="text-2xl font-bold">{formatGNF(totals?.total || 0)}</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Montant encaissé</div>
        <div className="text-2xl font-bold text-green-500">{formatGNF(totals?.paid || 0)}</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Reste à payer</div>
        <div className="text-2xl font-bold text-yellow-500">{formatGNF(totals?.remaining || 0)}</div>
      </div>
    </div>
  );
}
