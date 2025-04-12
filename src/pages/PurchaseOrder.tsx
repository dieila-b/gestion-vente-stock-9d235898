
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const PurchaseOrderPage = () => {
  // Use the purchase orders hook
  const { 
    orders, 
    isLoading,
    handleApprove, 
    handleDelete, 
    handleEdit 
  } = usePurchaseOrders();

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
        
        <PurchaseOrderList
          orders={orders || []}
          isLoading={isLoading}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrderPage;
