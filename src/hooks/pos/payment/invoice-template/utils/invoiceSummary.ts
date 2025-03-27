
import { formatGNF } from "@/lib/currency";
import { numberToWords } from "@/lib/numberToWords";

/**
 * Generate the summary table
 */
export function generateSummaryTable(subtotal: number, totalDiscount: number, total: number): string {
  return `
    <div style="display: flex; justify-content: flex-end;">
      <table class="summary-table" style="width: auto;">
        <tr>
          <td><strong>Montant Total</strong></td>
          <td style="text-align: right; width: 120px;">${formatGNF(subtotal)}</td>
        </tr>
        <tr>
          <td><strong>Remise</strong></td>
          <td style="text-align: right;">${formatGNF(totalDiscount)}</td>
        </tr>
        <tr>
          <td><strong>Net à Payer</strong></td>
          <td style="text-align: right;">${formatGNF(total)}</td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Generate the amount in words section
 */
export function generateAmountInWords(total: number): string {
  return `
    <div class="amount-in-words">
      <p><strong>Arrêtée la présente facture à la somme de:</strong> ${numberToWords(total)} Franc Guinéen</p>
    </div>
  `;
}
