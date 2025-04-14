
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { usePurchasePrint } from "@/hooks/purchases/use-purchase-print";
import { isSelectQueryError } from "@/utils/type-utils";
import type { PurchaseOrder } from "@/types/purchaseOrder";

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
  
  const { printPurchaseOrder } = usePurchasePrint();
  
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
      
      // Cast the raw order to any type first to avoid TypeScript errors
      const rawOrderAny = order as any;
      
      // Return a complete PurchaseOrder object with required properties
      return {
        ...order,
        supplier,
        deleted: false,
        // Add empty items array if not present using optional chaining
        items: rawOrderAny.items ? rawOrderAny.items : []
      } as unknown as PurchaseOrder;
    });
    
    // Filter processed orders based on search query
    const filtered = processedOrders.filter(order => 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOrders(filtered);
  }, [rawOrders, searchQuery]);

  // Handler for printing a purchase order
  const handlePrint = (order: PurchaseOrder) => {
    printPurchaseOrder(order);
  };

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
              onPrint={handlePrint}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
