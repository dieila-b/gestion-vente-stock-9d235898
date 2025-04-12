
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// First, let's create a simplified version of the PurchaseOrder interface
interface SimplePurchaseOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  supplier: { name: string };
  created_at: string;
}

const PurchaseOrderPage = () => {
  // Use a simplified version of the purchase orders hook return
  const usePurchaseOrdersResult = usePurchaseOrders();
  
  // Extract just the orders we need in a safe way
  const orders: SimplePurchaseOrder[] = usePurchaseOrdersResult.orders?.map(order => ({
    id: order.id,
    order_number: order.order_number || 'N/A',
    status: order.status || 'pending',
    payment_status: order.payment_status || 'pending',
    total_amount: order.total_amount || 0,
    supplier: { 
      name: order.supplier && typeof order.supplier === 'object' && !order.supplier.error
        ? order.supplier.name || 'Unknown Supplier'
        : 'Unknown Supplier'
    },
    created_at: order.created_at || new Date().toISOString()
  })) || [];

  const isLoading = usePurchaseOrdersResult.isLoading;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bons de commande</h1>
          <Link to="/purchase-orders/new">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau bon de commande
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des bons de commande</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Chargement des bons de commande...</div>
            ) : orders.length === 0 ? (
              <div>Aucun bon de commande trouvé</div>
            ) : (
              <div className="space-y-2">
                {orders.map(order => (
                  <div key={order.id} className="p-4 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Bon de commande #{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          Fournisseur: {order.supplier.name}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-right">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'GNF',
                            minimumFractionDigits: 0
                          }).format(order.total_amount)}
                        </p>
                        <p className="text-sm text-right">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrderPage;
