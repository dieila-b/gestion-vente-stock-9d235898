
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Info, AlertCircle } from "lucide-react";
import { safeFetchFromTable, safeSupplier } from "@/utils/supabase-safe-query";

interface OrderInfoFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  warehouses: any[];
  isSubmitting: boolean;
  onProceed: () => void;
}

export const OrderInfoForm = ({ formData, onChange, warehouses, isSubmitting, onProceed }: OrderInfoFormProps) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        // Safely fetch suppliers from the database
        const fetchedSuppliers = await safeFetchFromTable(
          'suppliers',
          (query) => query.select('id, name').order('name'),
          [],
          "Erreur lors de la récupération des fournisseurs"
        );
        
        setSuppliers(fetchedSuppliers || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed();
  };

  const isValid = formData.warehouse_id && formData.supplier_id && formData.order_number;

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="order_number">Numéro de commande</Label>
              <Input
                id="order_number"
                placeholder="BON-1234"
                value={formData.order_number}
                onChange={(e) => onChange('order_number', e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Select value={formData.supplier_id} onValueChange={(value) => onChange('supplier_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => {
                    const safeSupplierData = safeSupplier(supplier);
                    return (
                      <SelectItem key={safeSupplierData.id} value={safeSupplierData.id}>
                        {safeSupplierData.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="warehouse">Entrepôt</Label>
              <Select value={formData.warehouse_id} onValueChange={(value) => onChange('warehouse_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un entrepôt" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Date de livraison attendue</Label>
              <DatePicker
                date={formData.expected_delivery_date ? new Date(formData.expected_delivery_date) : undefined}
                onChange={(date) => onChange('expected_delivery_date', date)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles..."
              value={formData.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              rows={4}
            />
          </div>

          {!isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Veuillez remplir tous les champs obligatoires.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Chargement..." : "Continuer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
