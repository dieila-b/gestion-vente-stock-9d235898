
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";

interface OrderSummarySectionProps {
  subtotal: number;
  tax: number;
  total: number;
}

export const OrderSummarySection = ({ subtotal, tax, total }: OrderSummarySectionProps) => {
  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Sous-total</label>
          <Input
            value={formatGNF(subtotal)}
            readOnly
            className="neo-blur bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">TVA</label>
          <Input
            value={formatGNF(tax)}
            readOnly
            className="neo-blur bg-white/5 border-white/20 text-white"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Total TTC</label>
        <Input
          value={formatGNF(total)}
          readOnly
          className="neo-blur bg-white/5 border-white/20 text-white font-bold text-lg"
        />
      </div>
    </div>
  );
};
