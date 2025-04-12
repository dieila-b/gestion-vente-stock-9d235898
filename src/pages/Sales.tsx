
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientSelect } from "@/components/clients/ClientSelect";
import { ProductSelector } from "@/components/sales/ProductSelector"; // Import the ProductSelector
import { PreorderCart } from "@/components/sales/PreorderCart"; // Import the PreorderCart
import { Client } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Sales = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  
  // Add your other state and functions here
  
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Add product to cart
  const handleAddToCart = (product: any) => {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Update quantity
      const updatedCart = cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
          : item
      );
      setCart(updatedCart);
    } else {
      // Add new item
      const newItem = {
        id: Date.now().toString(), // Temporary ID
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      };
      setCart([...cart, newItem]);
    }
  };
  
  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  // Update item quantity
  const handleQuantityChange = (id: string, quantity: number) => {
    const updatedCart = cart.map(item => 
      item.id === id 
        ? { ...item, quantity, subtotal: quantity * item.price } 
        : item
    );
    setCart(updatedCart);
  };
  
  // Handle notes change
  const [notes, setNotes] = useState("");
  const handleNotesChange = (value: string) => {
    setNotes(value);
  };
  
  // Handle submit
  const handleSubmit = () => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    
    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    
    // Process sale logic would go here
    console.log("Processing sale", { client: selectedClient, cart, notes });
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Ventes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Client</h2>
              <ClientSelect 
                selectedClient={selectedClient} 
                onClientSelect={setSelectedClient}
              />
            </div>
            
            <ProductSelector 
              products={products} 
              isLoading={isLoadingProducts} 
              onAddToCart={handleAddToCart} 
            />
          </div>
          
          <div>
            <PreorderCart 
              items={cart}
              onRemoveItem={handleRemoveItem}
              onQuantityChange={handleQuantityChange}
              onSubmit={handleSubmit}
              onNotesChange={handleNotesChange}
              notes={notes}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
