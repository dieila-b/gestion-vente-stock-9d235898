
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface PaymentCounterSectionProps {
  paidAmount: number;
  setPaidAmount: (value: number) => void;
  total: number;
  remainingAmount: number;
  formatPrice: (value: number) => string;
}

export const PaymentCounterSection = ({
  paidAmount,
  setPaidAmount,
  total,
  remainingAmount,
  formatPrice,
}: PaymentCounterSectionProps) => {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Compteur de Paiements
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-white/80">Montant payé</Label>
          <Input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            className="neo-blur border-white/10"
            min="0"
            max={total}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white/80">Montant total</Label>
          <Input
            value={formatPrice(total)}
            readOnly
            className="neo-blur bg-white/5 border-white/10 text-white/80"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white/80">Montant restant</Label>
          <Input
            value={formatPrice(remainingAmount)}
            readOnly
            className="neo-blur bg-white/5 border-white/10 text-white/80"
          />
        </div>
      </div>
    </div>
  );
};
