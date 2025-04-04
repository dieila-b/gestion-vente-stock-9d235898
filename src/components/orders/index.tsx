
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Order } from "./Order";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { OrderDialog } from "./OrderDialog";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    // Simulate fetching orders
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          order_number: "ORD-001",
          client_name: "ABC Corporation",
          order_date: "2023-04-01",
          total_amount: 4500000,
          status: "pending",
          items: [
            { id: "i1", name: "Laptop Dell XPS", quantity: 2, price: 1500000 },
            { id: "i2", name: "Écran Samsung 27\"", quantity: 3, price: 500000 }
          ]
        },
        {
          id: "2",
          order_number: "ORD-002",
          client_name: "Tech Solutions",
          order_date: "2023-04-05",
          total_amount: 2750000,
          status: "completed",
          items: [
            { id: "i3", name: "Imprimante HP LaserJet", quantity: 1, price: 750000 },
            { id: "i4", name: "MacBook Pro", quantity: 1, price: 2000000 }
          ]
        },
        {
          id: "3",
          order_number: "ORD-003",
          client_name: "Global Traders",
          order_date: "2023-04-10",
          total_amount: 3650000,
          status: "in-progress",
          items: [
            { id: "i5", name: "Router Cisco", quantity: 2, price: 1200000 },
            { id: "i6", name: "Switch Netgear", quantity: 5, price: 250000 }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowDialog(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowDialog(true);
  };

  const handleViewOrder = (order) => {
    // Handle order view
    console.log("Viewing order:", order);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingOrder(null);
  };

  const handleSaveOrder = (orderData) => {
    if (editingOrder) {
      // Update existing order
      setOrders(
        orders.map((order) =>
          order.id === editingOrder.id ? { ...order, ...orderData } : order
        )
      );
    } else {
      // Add new order
      const newOrder = {
        id: Date.now().toString(),
        ...orderData,
        order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        order_date: new Date().toISOString().split('T')[0]
      };
      setOrders([...orders, newOrder]);
    }
    setShowDialog(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <Button onClick={handleAddOrder}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      <Card className="p-6">
        <OrdersHeader />
        <OrdersTable
          orders={orders}
          isLoading={isLoading}
          onEdit={handleEditOrder}
          onView={handleViewOrder}
        />
      </Card>

      <OrderDialog
        open={showDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveOrder}
        order={editingOrder}
      />
    </div>
  );
}
