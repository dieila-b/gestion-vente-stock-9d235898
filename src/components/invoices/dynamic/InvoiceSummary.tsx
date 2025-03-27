
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
      <div className="flex justify-end">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <table className="w-full">
            <tbody>
              <tr className="border border-gray-200">
                <td className="p-1.5 font-semibold text-sm">Montant Total</td>
                <td className="p-1.5 text-right text-sm">{formatGNF(subtotal)}</td>
              </tr>
              <tr className="border border-gray-200">
                <td className="p-1.5 font-semibold text-sm">Remise</td>
                <td className="p-1.5 text-right text-sm">{formatGNF(discount)}</td>
              </tr>
              {shipping_cost > 0 && (
                <tr className="border border-gray-200">
                  <td className="p-1.5 font-semibold text-sm">Frais de transport</td>
                  <td className="p-1.5 text-right text-sm">{formatGNF(shipping_cost)}</td>
                </tr>
              )}
              <tr className="border border-gray-200 font-bold">
                <td className="p-1.5 text-sm">Net A Payer</td>
                <td className="p-1.5 text-right text-sm">{formatGNF(netTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-2 border-t border-black border-b text-xs">
        <p className="font-semibold italic">
          Arrêtée la présente facture à la somme de: {numberToWords(netTotal)} Franc Guinéen
        </p>
      </div>
    </div>
  );
}
