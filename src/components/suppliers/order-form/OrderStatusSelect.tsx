
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OrderStatusSelectProps {
  value: "pending" | "delivered";
  onChange: (value: "pending" | "delivered") => void;
}

export const OrderStatusSelect = ({ value, onChange }: OrderStatusSelectProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-white/80">Statut de la commande</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="pending"
            id="order-pending"
            className="border-white/20 text-purple-500"
          />
          <Label htmlFor="order-pending" className="text-white/60">En attente</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="delivered"
            id="delivered"
            className="border-white/20 text-green-500"
          />
          <Label htmlFor="delivered" className="text-white/60">Livrée</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
