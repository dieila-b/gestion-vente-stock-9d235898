
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";
import type { Supplier } from "@/types/supplier";

interface SupplierInfoProps {
  supplier: Supplier;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
}

export const SupplierInfo = ({ supplier, deliveryDate, onDeliveryDateChange }: SupplierInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-white/80">Fournisseur</Label>
        <Input 
          value={supplier.name} 
          disabled 
          className="neo-blur bg-white/5 border-white/10 focus-visible:ring-white/20" 
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/80">Date de livraison prévue</Label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            type="date"
            className="pl-10 neo-blur border-white/10 focus-visible:ring-white/20"
            value={deliveryDate}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

