
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
  console.log("SupplierDateSection - suppliers data:", suppliers);
  console.log("SupplierDateSection - suppliers count:", suppliers?.length || 0);
  console.log("SupplierDateSection - current supplier:", supplier);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-white/80">Fournisseur *</Label>
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger className="neo-blur border-white/10">
            <SelectValue placeholder="Sélectionner un fournisseur" />
          </SelectTrigger>
          <SelectContent className="bg-black/80 backdrop-blur-md border-white/10">
            {!suppliers ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Chargement des fournisseurs...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Aucun fournisseur disponible
              </div>
            ) : (
              suppliers.map((supplierItem) => {
                console.log("Rendering supplier:", supplierItem);
                return (
                  <SelectItem key={supplierItem.id} value={supplierItem.id}>
                    {supplierItem.name || supplierItem.contact || `Fournisseur #${supplierItem.id.slice(0, 8)}`}
                  </SelectItem>
                );
              })
            )}
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
