
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { isSelectQueryError } from "@/utils/type-utils";
import type { PurchaseOrder } from "@/types/purchase-order";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const { 
    orders: rawOrders, 
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit
  } = usePurchaseOrders();
  
  // Process orders to ensure they match the PurchaseOrder type
  useEffect(() => {
    const processedOrders = rawOrders.map(order => {
      // Create properly typed supplier
      let supplier;
      if (isSelectQueryError(order.supplier)) {
        supplier = { 
          id: '',
          name: 'Fournisseur inconnu', 
          phone: '', 
          email: '' 
        };
      } else if (!order.supplier) {
        supplier = {
          id: order.supplier_id || '',
          name: 'Fournisseur non spécifié', 
          phone: '', 
          email: '' 
        };
      } else {
        // Since TypeScript thinks order.supplier might be 'never', we need to use type casting
        const supplierData = order.supplier as any;
        supplier = {
          id: order.supplier_id || (supplierData.id || ''),
          name: supplierData.name || 'Fournisseur non spécifié',
          phone: supplierData.phone || '',
          email: supplierData.email || ''
        };
      }
      
      // Return a complete PurchaseOrder object
      return {
        ...order,
        supplier
      } as PurchaseOrder;
    });
    
    // Filter processed orders based on search query
    const filtered = processedOrders.filter(order => 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOrders(filtered);
  }, [rawOrders, searchQuery]);

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
