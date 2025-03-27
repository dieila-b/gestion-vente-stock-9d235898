
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface OrderInfoFormProps {
  orderNumber: string;
  setOrderNumber: (value: string) => void;
  supplier: string;
  setSupplier: (value: string) => void;
  deliveryDate: string;
  setDeliveryDate: (value: string) => void;
  warehouseId: string;
  setWarehouseId: (value: string) => void;
}

export const OrderInfoForm = ({
  orderNumber,
  setOrderNumber,
  supplier,
  setSupplier,
  deliveryDate,
  setDeliveryDate,
  warehouseId,
  setWarehouseId
}: OrderInfoFormProps) => {
  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="order-number">Numéro de commande</Label>
        <Input
          id="order-number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="supplier">Fournisseur</Label>
        <Select value={supplier} onValueChange={setSupplier} required>
          <SelectTrigger id="supplier">
            <SelectValue placeholder="Sélectionner un fournisseur" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="delivery-date">Date de livraison prévue</Label>
        <Input
          id="delivery-date"
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="warehouse">Entrepôt de livraison</Label>
        <Select value={warehouseId} onValueChange={setWarehouseId}>
          <SelectTrigger id="warehouse">
            <SelectValue placeholder="Sélectionner un entrepôt" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
