
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PreorderCart } from '@/components/preorder/PreorderCart';
import { PreorderClient } from '@/components/preorder/PreorderClient';
import { PreorderProductList } from '@/components/preorder/PreorderProductList';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Client } from '@/types/client';
import { InvoicePreview } from '@/components/preorder/InvoicePreview';
import { CartItem } from '@/types/pos';
import { usePreorderSubmit } from '@/hooks/preorder/usePreorderSubmit';
import { usePreorderCart } from '@/components/preorder/hooks/usePreorderCart';

export default function Preorders() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'preview'>('cart');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { cart, selectedClient, addToCart, removeFromCart, clearCart, updateQuantity } = usePreorderCart();
  const { submitPreorder } = usePreorderSubmit();
  
  const handleClientSelect = (client: Client) => {
    // Using the client as is
  };
  
  const isCartEmpty = cart.length === 0;
  const isClientSelected = !!selectedClient;
  
  const handleGoToPreview = () => {
    if (isCartEmpty) {
      toast.error("Veuillez ajouter des produits au panier");
      return;
    }
    
    if (!isClientSelected) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    
    setStep('preview');
  };
  
  const handleBackToCart = () => {
    setStep('cart');
  };
  
  const handleValidatePreorder = async () => {
    if (isCartEmpty || !isClientSelected) {
      toast.error("Informations incomplètes");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitPreorder(cart, selectedClient, notes);
      clearCart();
      navigate('/dashboard');
      toast.success("Précommande enregistrée avec succès");
    } catch (error) {
      console.error('Error submitting preorder:', error);
      toast.error("Erreur lors de l'enregistrement de la précommande");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer une Précommande</h1>
        
        {step === 'cart' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              <PreorderClient 
                client={selectedClient} 
                onClientChange={handleClientSelect} 
              />
              
              <PreorderProductList 
                addToCart={(product, quantity = 1) => addToCart(product, quantity)} 
              />
            </div>
            
            <div className="md:col-span-4">
              <PreorderCart 
                cart={cart} 
                onUpdateQuantity={updateQuantity} 
                onRemoveItem={removeFromCart} 
                onClearCart={clearCart}
                notes={notes}
                onNotesChange={setNotes}
              />
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleGoToPreview}
                  disabled={isCartEmpty || !isClientSelected}
                >
                  Aperçu de la précommande
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleBackToCart}>
                Retour au panier
              </Button>
              <Button 
                onClick={handleValidatePreorder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Valider la précommande'}
              </Button>
            </div>
            
            {selectedClient && (
              <InvoicePreview 
                client={selectedClient}
                cart={cart}
                notes={notes}
                onNotesChange={setNotes}
                onValidate={handleValidatePreorder}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
