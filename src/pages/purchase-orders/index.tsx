
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    orders, 
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit
  } = usePurchaseOrders();
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <PurchaseOrderHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Card className="mt-6">
          <CardContent className="pt-6">
            <PurchaseOrderList 
              orders={filteredOrders}
              isLoading={isLoading}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
