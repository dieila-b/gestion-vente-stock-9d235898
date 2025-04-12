import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFetchPurchaseOrders } from "@/hooks/use-purchase-orders";
import { isSelectQueryError } from "@/utils/type-utils";

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: {
    name: string;
  };
  // ... other properties
}

export default function PurchaseOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { data: purchaseOrders, isLoading } = useFetchPurchaseOrders();

  useEffect(() => {
    if (purchaseOrders && id) {
      const order = purchaseOrders.find((order) => order.id === id);
      if (order) {
        // Create a safe PurchaseOrder object with all required properties
        const safeOrder: PurchaseOrder = {
          ...order,
          supplier: order.supplier && !isSelectQueryError(order.supplier) 
            ? order.supplier
            : { name: 'Supplier not available' }
        };
        
        setPurchaseOrder(safeOrder);
      } else {
        console.log("Purchase order not found");
        navigate('/purchase-orders');
      }
    }
  }, [purchaseOrders, id, navigate]);

  if (isLoading) {
    return <div>Loading purchase order...</div>;
  }

  if (!purchaseOrder) {
    return <div>Purchase order not found.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1>Purchase Order Details</h1>
      <p>Order Number: {purchaseOrder.order_number}</p>
      {purchaseOrder.supplier && (
        <p>Supplier: {purchaseOrder.supplier.name}</p>
      )}
      <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
        Back to Purchase Orders
      </Button>
    </div>
  );
}
