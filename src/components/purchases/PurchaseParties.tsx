
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/types/client";
import { Supplier } from "@/types/supplier";

interface PurchasePartiesProps {
  selectedSupplier: string;
  suppliers: Supplier[];
  onSupplierSelect: (supplierId: string) => void;
}

export const PurchaseParties = ({
  selectedSupplier,
  suppliers,
  onSupplierSelect,
}: PurchasePartiesProps) => {
  return (
    <Card className="p-6 neo-blur">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Fournisseur</Label>
          <Select value={selectedSupplier} onValueChange={onSupplierSelect}>
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
      </div>
    </Card>
  );
};
