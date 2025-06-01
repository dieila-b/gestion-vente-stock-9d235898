
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export function WarehouseStockList() {
  const { data: warehouseStock = [], isLoading } = useQuery({
    queryKey: ['warehouse-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_stock')
        .select(`
          *,
          product:catalog(name, reference),
          warehouse:warehouses(name),
          pos_location:pos_locations(name)
        `);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Stock par Entrepôt</h2>
      </div>
      
      <div className="space-y-4">
        {warehouseStock.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun stock disponible
          </p>
        ) : (
          warehouseStock.map((stock) => (
            <div key={stock.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{stock.product?.name || 'Produit inconnu'}</h3>
                <p className="text-sm text-muted-foreground">
                  {stock.product?.reference || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stock.warehouse?.name || stock.pos_location?.name || 'Emplacement inconnu'}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={stock.quantity > 0 ? "default" : "secondary"}>
                  {stock.quantity} unités
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {stock.total_value?.toLocaleString('fr-FR')} GNF
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
