
import { formatGNF } from "@/lib/currency";

export function YearlyReportStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Ventes</div>
        <div className="text-2xl font-bold">1</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">CA</div>
        <div className="text-2xl font-bold">{formatGNF(11750000)}</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">Produits</div>
        <div className="text-2xl font-bold">50</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5">
        <div className="text-sm text-muted-foreground">% marge</div>
        <div className="text-2xl font-bold">40.43%</div>
      </div>
    </div>
  );
}
