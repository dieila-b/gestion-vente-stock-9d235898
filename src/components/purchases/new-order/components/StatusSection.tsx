
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StatusSectionProps {
  paymentStatus: "pending" | "partial" | "paid";
  setPaymentStatus: (status: "pending" | "partial" | "paid") => void;
  orderStatus: "pending" | "delivered";
  setOrderStatus: (status: "pending" | "delivered") => void;
}

export const StatusSection = ({
  paymentStatus,
  setPaymentStatus,
  orderStatus,
  setOrderStatus,
}: StatusSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Label className="text-white/80">Statut du paiement</Label>
        <RadioGroup
          value={paymentStatus}
          onValueChange={(value) => setPaymentStatus(value as "pending" | "partial" | "paid")}
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
      <div className="space-y-4">
        <Label className="text-white/80">Statut de la commande</Label>
        <RadioGroup
          value={orderStatus}
          onValueChange={(value) => setOrderStatus(value as "pending" | "delivered")}
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
    </div>
  );
};
