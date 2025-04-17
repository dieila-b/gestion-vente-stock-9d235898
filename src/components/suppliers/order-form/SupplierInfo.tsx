
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerCustom } from "@/components/ui/date-picker-custom";
import type { Supplier } from "@/types/supplier";

interface SupplierInfoProps {
  supplier: Supplier;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
}

export const SupplierInfo = ({ supplier, deliveryDate, onDeliveryDateChange }: SupplierInfoProps) => {
  const date = deliveryDate ? new Date(deliveryDate) : undefined;
  
  const handleDateChange = (date: Date | undefined) => {
    onDeliveryDateChange(date ? date.toISOString() : '');
  };

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
        <DatePickerCustom
          date={date}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  );
};
