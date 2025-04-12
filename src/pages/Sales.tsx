
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientSelect } from "@/components/clients/ClientSelect";
import { Client } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Placeholder components until they're properly implemented
const ProductSelector = ({ products, isLoading, onAddToCart }: any) => (
  <div className="bg-card rounded-lg shadow-md p-4">
    <h2 className="text-lg font-semibold mb-4">Produits</h2>
    {isLoading ? (
      <p>Chargement des produits...</p>
    ) : (
      <div className="grid grid-cols-2 gap-2">
        {products.map((product: any) => (
          <div 
            key={product.id} 
            className="p-2 border rounded cursor-pointer hover:bg-accent"
            onClick={() => onAddToCart(product)}
          >
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.price} GNF</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PreorderCart = ({ items, onRemoveItem, onQuantityChange, onSubmit, onNotesChange, notes, isLoading }: any) => (
  <div className="bg-card rounded-lg shadow-md p-4">
    <h2 className="text-lg font-semibold mb-4">Panier</h2>
    {items.length === 0 ? (
      <p className="text-muted-foreground">Votre panier est vide</p>
    ) : (
      <div className="space-y-4">
        {items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p>{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.price} GNF x {item.quantity}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="px-2 py-1 bg-secondary rounded"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              >-</button>
              <span>{item.quantity}</span>
              <button 
                className="px-2 py-1 bg-secondary rounded"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              >+</button>
              <button 
                className="ml-2 text-red-500"
                onClick={() => onRemoveItem(item.id)}
              >X</button>
            </div>
          </div>
        ))}
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea 
            className="w-full p-2 border rounded" 
            value={notes} 
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
        
        <button 
          className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Traitement...' : 'Valider la commande'}
        </button>
      </div>
    )}
  </div>
);

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
