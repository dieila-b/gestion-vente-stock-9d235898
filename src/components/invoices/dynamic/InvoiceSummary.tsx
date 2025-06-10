
import { formatGNF } from "@/lib/currency";
import { numberToWords } from "@/lib/numberToWords";

interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  shipping_cost?: number;
}

export function InvoiceSummary({ subtotal, discount, total, shipping_cost = 0 }: InvoiceSummaryProps) {
  // The net total is the subtotal minus the discount plus shipping
  const netTotal = subtotal - discount + shipping_cost;
  
  return (
    <div className="space-y-0 text-black">
      <div className="border-b border-black">
        <div className="flex justify-end p-4">
          <table className="w-80">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2 text-right font-bold">Montant Total</td>
                <td className="p-2 text-right">{formatGNF(subtotal)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 text-right font-bold">Remise</td>
                <td className="p-2 text-right">{formatGNF(discount)}</td>
              </tr>
              {shipping_cost > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-right font-bold">Frais de transport</td>
                  <td className="p-2 text-right">{formatGNF(shipping_cost)}</td>
                </tr>
              )}
              <tr className="font-bold">
                <td className="p-2 text-right">Net A Payer</td>
                <td className="p-2 text-right">{formatGNF(netTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="border-b border-black p-4">
        <p className="text-sm italic">
          <span className="font-bold">Arrêtée la présente facture à la somme de:</span> {numberToWords(netTotal)} Franc Guinéen
        </p>
      </div>
    </div>
  );
}
