
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupplierSectionProps {
  selectedSupplier: string;
  setSelectedSupplier: (supplierId: string) => void;
  suppliers: any[];
}

export const SupplierSection = ({ 
  selectedSupplier, 
  setSelectedSupplier, 
  suppliers 
}: SupplierSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-white/80">Fournisseur</Label>
      <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
        <SelectTrigger className="neo-blur">
          <SelectValue placeholder="Sélectionner un fournisseur" />
        </SelectTrigger>
        <SelectContent>
          {suppliers?.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
