
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseOrderHeader } from "@/components/purchases/PurchaseOrderHeader";
import { PurchaseOrderList } from "@/components/purchases/PurchaseOrderList";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { usePurchasePrint } from "@/hooks/purchases/use-purchase-print";
import { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  
  const { 
    orders: rawOrders, 
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit,
    EditDialog,
    refreshOrders
  } = usePurchaseOrders();
  
  const { printPurchaseOrder } = usePurchasePrint();

  // Traitement et filtrage des commandes
  useEffect(() => {
    console.log("Traitement des bons de commande bruts:", rawOrders?.length || 0);
    
    if (!rawOrders || rawOrders.length === 0) {
      console.log("Aucune commande à traiter");
      setFilteredOrders([]);
      return;
    }
    
    try {
      // Appliquer le filtre de recherche
      const filtered = rawOrders.filter(order => 
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      console.log("Commandes filtrées:", filtered.length);
      
      // Vérification des articles
      filtered.forEach(order => {
        console.log(`Commande ${order.order_number} contient ${order.items?.length || 0} articles`);
      });
      
      setFilteredOrders(filtered);
    } catch (error) {
      console.error("Erreur lors du traitement des commandes:", error);
      toast.error("Erreur lors du traitement des bons de commande");
      setFilteredOrders([]);
    }
  }, [rawOrders, searchQuery]);

  // Rafraîchir les données au chargement initial
  useEffect(() => {
    console.log("Chargement initial - rafraîchissement des bons de commande");
    refreshOrders();
  }, [refreshOrders]);

  // Gestion de l'impression
  const handlePrint = (order: PurchaseOrder) => {
    console.log("Impression de la commande avec articles:", order.items?.length || 0);
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
        
        {/* Rendu du composant EditDialog */}
        <EditDialog />
      </div>
    </DashboardLayout>
  );
}
