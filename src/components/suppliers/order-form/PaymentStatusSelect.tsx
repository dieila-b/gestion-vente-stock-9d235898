
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentStatusSelectProps {
  value: "pending" | "partial" | "paid";
  onChange: (value: "pending" | "partial" | "paid") => void;
}

export const PaymentStatusSelect = ({ value, onChange }: PaymentStatusSelectProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-white/80">Statut du paiement</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-3 gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="pending"
            id="pending"
            className="border-white/20 text-purple-500"
          />
          <Label htmlFor="pending" className="text-white/60">En attente</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="partial"
            id="partial"
            className="border-white/20 text-blue-500"
          />
          <Label htmlFor="partial" className="text-white/60">Partiel</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="paid"
            id="paid"
            className="border-white/20 text-green-500"
          />
          <Label htmlFor="paid" className="text-white/60">Payé</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
