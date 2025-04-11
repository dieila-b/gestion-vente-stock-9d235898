
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PreorderCart from '@/components/preorder/PreorderCart';
import PreorderClient from '@/components/preorder/PreorderClient';
import PreorderProductList from '@/components/preorder/PreorderProductList';
import { Client } from '@/types/client';
import { CartItem } from '@/types/pos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicePreview from '@/components/preorder/InvoicePreview';
import { usePreorderActions } from '@/components/preorder/hooks/usePreorderActions';
import { usePreorderCart } from '@/components/preorder/hooks/usePreorderCart';
import { useNavigate } from 'react-router-dom';

export default function Preorders() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();

  const {
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    clearCart,
    setCartItemQuantity,
    validatePreorder,
    isSubmitting,
  } = usePreorderActions();

  const handleClientChange = (client: Client | null) => {
    setSelectedClient(client);
  };

  const handleAddToCart = (product: any, quantity: number = 1) => {
    addToCart(cart, setCart, product, quantity);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(cart, setCart, productId);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(cart, setCart, productId, quantity);
  };

  const handleUpdateDiscount = (productId: string, discount: number) => {
    updateDiscount(cart, setCart, productId, discount);
  };

  const handleValidatePreorder = async () => {
    const result = await validatePreorder(selectedClient, cart, notes);
    if (result) {
      clearCart(setCart);
      setSelectedClient(null);
      setNotes("");
      navigate('/preorders/list');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des Précommandes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <PreorderClient 
              selectedClient={selectedClient}
              onClientChange={handleClientChange}
            />
            
            <PreorderCart 
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
              onUpdateDiscount={handleUpdateDiscount}
            />
          </div>
          
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="h-full">
                <PreorderProductList 
                  onAddToCart={handleAddToCart}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="h-full">
                <InvoicePreview 
                  client={selectedClient}
                  cart={cart}
                  notes={notes}
                  onNotesChange={setNotes}
                  onValidate={handleValidatePreorder}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
