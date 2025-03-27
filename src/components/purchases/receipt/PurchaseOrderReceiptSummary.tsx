
import { numberToWords } from "@/lib/numberToWords";

interface PurchaseOrderReceiptSummaryProps {
  totalAmount: number;
  formatGNF: (amount: number) => string;
  discount?: number;
}

export function PurchaseOrderReceiptSummary({ 
  totalAmount, 
  formatGNF, 
  discount = 0 
}: PurchaseOrderReceiptSummaryProps) {
  const subtotal = totalAmount + discount;
  const netTotal = totalAmount;
  
  return (
    <>
      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="border border-gray-200">
            <div className="flex justify-between p-1 border-b">
              <span className="font-semibold">Montant TTC</span>
              <span>{formatGNF(subtotal)}</span>
            </div>
            <div className="flex justify-between p-1 border-b">
              <span className="font-semibold">Remise</span>
              <span>{formatGNF(discount)}</span>
            </div>
            <div className="flex justify-between p-1 font-bold bg-gray-100">
              <span>Net A Payer</span>
              <span>{formatGNF(netTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="mt-4 mb-8">
        <p className="font-semibold">
          Arrêtée la présente facture à la somme de: <span className="italic">{numberToWords(netTotal)} Franc Guinéen</span>
        </p>
      </div>

      {/* Footer line */}
      <div className="mt-16 pt-2 border-t border-gray-300 text-xs text-center text-gray-600">
        ACCEL - Adresse: Abidjan - Tél: +225 05 55 95 45 33
      </div>
    </>
  );
}
