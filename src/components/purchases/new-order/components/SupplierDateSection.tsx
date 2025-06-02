
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerCustom } from "@/components/ui/date-picker-custom";
import { Supplier } from "@/types/supplier";

interface SupplierDateSectionProps {
  supplier: string;
  setSupplier: (supplierId: string) => void;
  deliveryDate: Date | undefined;
  setDeliveryDate: (date: Date | undefined) => void;
  suppliers: Supplier[] | undefined;
}

export const SupplierDateSection = ({
  supplier,
  setSupplier,
  deliveryDate,
  setDeliveryDate,
  suppliers,
}: SupplierDateSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-white/80">Fournisseur</Label>
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger className="neo-blur border-white/10">
            <SelectValue placeholder="Sélectionner un fournisseur" />
          </SelectTrigger>
          <SelectContent className="bg-black/80 backdrop-blur-md border-white/10">
            {suppliers?.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.contact || 'Contact non spécifié'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-white/80">Date de livraison prévue</Label>
        <DatePickerCustom
          date={deliveryDate}
          onDateChange={setDeliveryDate}
        />
      </div>
    </div>
  );
};
