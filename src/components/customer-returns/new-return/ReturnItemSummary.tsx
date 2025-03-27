
import { PackageCheck } from "lucide-react";

interface ReturnItemSummaryProps {
  itemsCount: number;
}

export function ReturnItemSummary({ itemsCount }: ReturnItemSummaryProps) {
  if (itemsCount === 0) {
    return null;
  }

  return (
    <div className="bg-green-100 dark:bg-green-900/30 rounded p-3 flex items-center gap-2 text-green-700 dark:text-green-400">
      <PackageCheck className="h-5 w-5" />
      <span>{itemsCount} article(s) sélectionné(s) pour le retour</span>
    </div>
  );
}
