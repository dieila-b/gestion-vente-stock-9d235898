
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft } from "lucide-react";

export function StockTransfersList() {
  const { data: stockTransfers = [], isLoading } = useQuery({
    queryKey: ['stock-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_transfers')
        .select(`
          *,
          product:catalog(name),
          from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(name),
          to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Transferts de Stock</h2>
      </div>
      
      <div className="space-y-4">
        {stockTransfers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun transfert de stock
          </p>
        ) : (
          stockTransfers.map((transfer) => (
            <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{transfer.product?.name || 'Produit inconnu'}</h3>
                <p className="text-sm text-muted-foreground">
                  {transfer.from_warehouse?.name || 'Source inconnue'} → {transfer.to_warehouse?.name || 'Destination inconnue'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transfer.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(transfer.status)}
                <p className="text-sm text-muted-foreground mt-1">
                  {transfer.quantity} unités
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
