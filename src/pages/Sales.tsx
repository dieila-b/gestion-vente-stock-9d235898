
import { useState, useEffect } from "react";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { ProductSelector } from "@/components/pos/ProductSelector";
import { PreorderCart } from "@/components/sales/PreorderCart";
import { Client } from "@/types/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePreorderStatus } from "@/hooks/use-preorder-status";

export default function Sales() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { cart, updateQuantity, removeFromCart, updateDiscount, clearCart, addToCart, setQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the preorder status hook to monitor and update preorder statuses
  const { pendingPreorders } = usePreorderStatus();

  const handleCheckout = async () => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    setIsLoading(true);
    try {
      // Determine if any items in cart have availability issues
      const preorderItems = cart.map(item => {
        let status = 'available';
        if (!item.stock || item.stock === 0) {
          status = 'pending';
        } else if (item.stock < item.quantity) {
          status = 'pending';
        }
        
        const unitPriceAfterDiscount = item.price - (item.discount || 0);
        
        return {
          product_id: item.id,
          quantity: item.quantity,
          unit_price: unitPriceAfterDiscount,
          total_price: unitPriceAfterDiscount * item.quantity,
          status,
          discount: item.discount || 0
        };
      });
      
      // Determine overall status based on items
      const allItemsAvailable = preorderItems.every(item => item.status === 'available');
      const preorderStatus = allItemsAvailable ? 'available' : 'pending';
      
      const totalAmount = cart.reduce((acc, item) => {
        const unitPriceAfterDiscount = item.price - (item.discount || 0);
        return acc + (unitPriceAfterDiscount * item.quantity);
      }, 0);

      // Créer la précommande
      const { data: preorder, error } = await supabase
        .from('preorders')
        .insert([{
          client_id: selectedClient.id,
          total_amount: totalAmount,
          status: preorderStatus,
          paid_amount: 0,
          remaining_amount: totalAmount
        }])
        .select()
        .single();

      if (error) throw error;

      // Créer les articles de la précommande
      const preorderItemsWithId = preorderItems.map(item => ({
        ...item,
        preorder_id: preorder.id
      }));

      const { error: itemsError } = await supabase
        .from('preorder_items')
        .insert(preorderItemsWithId);

      if (itemsError) throw itemsError;

      // Update stock for available items
      for (const item of cart) {
        if (item.stock && item.stock >= item.quantity) {
          const { error: stockError } = await supabase
            .from('catalog')
            .update({ stock: item.stock - item.quantity })
            .eq('id', item.id);
            
          if (stockError) {
            console.error('Error updating stock:', stockError);
          }
        }
      }

      if (preorderStatus === 'pending') {
        toast.success("Précommande enregistrée avec succès. Vous serez notifié lorsque tous les produits seront disponibles.");
      } else {
        toast.success("Précommande enregistrée avec succès.");
      }
      
      clearCart();
      setSelectedClient(null);
    } catch (error) {
      console.error('Error creating preorder:', error);
      toast.error("Erreur lors de l'enregistrement de la précommande");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCartItemQuantity = (productId: string, quantity: number) => {
    setQuantity(productId, quantity);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Ventes & Précommandes</h1>
        <p className="text-muted-foreground">
          Gérez les ventes et précommandes des clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ClientSelect 
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
          />
          <ProductSelector 
            onProductSelect={addToCart}
            onAddToCart={addToCart}
            showOutOfStock
          />
        </div>

        <PreorderCart 
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onUpdateDiscount={updateDiscount}
          onCheckout={handleCheckout}
          isLoading={isLoading}
          selectedClient={selectedClient}
          clearCart={clearCart}
          onSetQuantity={handleSetCartItemQuantity}
        />
      </div>
    </div>
  );
}
