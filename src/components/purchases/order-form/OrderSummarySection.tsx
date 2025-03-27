
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";

interface OrderSummarySectionProps {
  subtotal: number;
  tax: number;
  total: number;
}

export const OrderSummarySection = ({ subtotal, tax, total }: OrderSummarySectionProps) => {
  return (
    <div className="space-y-8 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Sous-total</label>
          <Input
            value={formatGNF(subtotal)}
            readOnly
            className="h-14 rounded-xl bg-transparent border-[#1EAEDB] border-2 text-white text-base neo-blur"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">TVA</label>
          <Input
            value={formatGNF(tax)}
            readOnly
            className="h-14 rounded-xl bg-transparent border-[#1EAEDB] border-2 text-white text-base neo-blur"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Total TTC</label>
        <Input
          value={formatGNF(total)}
          readOnly
          className="h-14 rounded-xl bg-transparent border-[#1EAEDB] border-2 text-white font-bold text-lg neo-blur"
        />
      </div>
    </div>
  );
};
