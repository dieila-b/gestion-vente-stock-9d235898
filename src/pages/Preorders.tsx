
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OrderForm } from '@/components/orders/OrderForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ClientSelect } from '@/components/clients/ClientSelect';
import { PreorderCart } from '@/components/preorders/PreorderCart';
import { PreorderInvoiceView } from '@/components/preorders/PreorderInvoiceView';
import { CartItem, CartState } from '@/types/CartState';

export default function Preorders() {
  const navigate = useNavigate();
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentPreorder, setCurrentPreorder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the cart state and methods
  const { 
    cart, 
    addItem, 
    removeItem, 
    updateQuantity, 
    addClient, 
    removeClient, 
    clearCart, 
    updateNotes 
  } = useCartStore();

  // Map cart methods to component methods
  const removeFromCart = removeItem;
  const updateDiscount = (discount: number) => {
    // Update discount logic would go here
  };
  const addToCart = addItem;
  const setCartItemQuantity = updateQuantity;
  
  // Validation function
  const validatePreorder = () => {
    if (!cart.items || cart.items.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la précommande");
      return false;
    }
    
    if (!cart.client) {
      toast.error("Veuillez sélectionner un client");
      return false;
    }
    
    return true;
  };

  // Handle preorder submission
  const handleSubmitPreorder = async () => {
    if (!validatePreorder()) return;
    
    try {
      setIsLoading(true);
      
      const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create preorder record
      const { data: preorderData, error: preorderError } = await supabase
        .from('preorders')
        .insert({
          client_id: cart.client?.id,
          status: 'pending',
          notes: cart.notes || '',
          total_amount: total,
          remaining_amount: total,
          paid_amount: 0
        })
        .select()
        .single();
      
      if (preorderError) throw preorderError;
      
      // Create preorder items
      const preorderItems = cart.items.map(item => ({
        preorder_id: preorderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        status: 'pending'
      }));
      
      const { error: itemsError } = await supabase
        .from('preorder_items')
        .insert(preorderItems);
      
      if (itemsError) throw itemsError;
      
      // Show success message and reset
      toast.success("Précommande créée avec succès");
      setCurrentPreorder(preorderData);
      setShowInvoiceDialog(true);
      clearCart();
      
    } catch (error: any) {
      console.error("Error creating preorder:", error);
      toast.error("Erreur lors de la création de la précommande: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseInvoice = () => {
    setShowInvoiceDialog(false);
    setCurrentPreorder(null);
  };
  
  const handlePrintInvoice = async (isReceipt = false) => {
    // Print invoice logic would go here
    toast.success(isReceipt ? "Reçu imprimé" : "Facture imprimée");
  };

  // Props for the invoice dialog
  const invoiceProps = {
    showInvoiceDialog,
    handleCloseInvoice,
    currentPreorder,
    handlePrintInvoice
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Précommandes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderForm 
            onAddToCart={addToCart} 
            isLoading={isLoading} 
          />
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-4">Client</h2>
            <ClientSelect 
              selectedClient={cart.client}
              onClientSelect={addClient}
              onClearClient={removeClient}
            />
          </div>
          
          <PreorderCart 
            items={cart.items || []}
            onRemoveItem={removeFromCart}
            onQuantityChange={setCartItemQuantity}
            onSubmit={handleSubmitPreorder}
            onNotesChange={updateNotes}
            notes={cart.notes}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {showInvoiceDialog && currentPreorder && (
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-4xl">
            <PreorderInvoiceView 
              cart={cart}
              client={cart.client}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={setCartItemQuantity}
              onAddToCart={addToCart}
              onUpdateNotes={updateNotes}
              onClearClient={removeClient}
              onSubmit={handleSubmitPreorder}
              onSelectClient={addClient}
              onSetDiscount={updateDiscount}
              onUpdateDiscount={updateDiscount}
              isLoading={isLoading}
              isEditMode={false}
              showInvoiceDialog={showInvoiceDialog}
              handleCloseInvoice={handleCloseInvoice}
              currentPreorder={currentPreorder}
              handlePrintInvoice={handlePrintInvoice}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
