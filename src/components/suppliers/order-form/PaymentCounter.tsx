
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentCounterProps {
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  onPaidAmountChange: (value: number) => void;
  formatPrice: (price: number) => string;
}

export const PaymentCounter = ({
  paidAmount,
  totalAmount,
  remainingAmount,
  onPaidAmountChange,
  formatPrice,
}: PaymentCounterProps) => {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur border border-white/10">
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
            onChange={(e) => onPaidAmountChange(Number(e.target.value))}
            className="neo-blur"
            min="0"
            max={totalAmount}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white/80">Montant total</Label>
          <Input
            value={formatPrice(totalAmount)}
            readOnly
            className="neo-blur bg-white/5"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white/80">Montant restant</Label>
          <Input
            value={formatPrice(remainingAmount)}
            readOnly
            className="neo-blur bg-white/5"
          />
        </div>
      </div>
    </div>
  );
};
