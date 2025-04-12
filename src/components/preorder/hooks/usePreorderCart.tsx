import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  client: any | null;
  notes: string;
}

const defaultCartState: CartState = {
  items: [],
  client: null,
  notes: "",
};

export function usePreorderCart() {
  const [cart, setCart] = useState<CartState>(defaultCartState);
  const { toast } = useToast();

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existingItemIndex = prev.items.findIndex(
        (i) => i.productId === item.productId
      );

      if (existingItemIndex !== -1) {
        const newItems = [...prev.items];
        newItems[existingItemIndex].quantity += item.quantity;
        return { ...prev, items: newItems };
      } else {
        return { ...prev, items: [...prev.items, item] };
      }
    });
    toast({
      title: "Produit ajouté",
      description: "Le produit a été ajouté au panier",
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
    toast({
      title: "Produit supprimé",
      description: "Le produit a été supprimé du panier",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      return { ...prev, items: newItems };
    });
  };
  
  // Add the client safely with status property
  const addClient = (client: any) => {
    const clientWithStatus = {
      ...client,
      status: client.status || 'active'
    };
    
    setCart((prev) => ({
      ...prev,
      client: clientWithStatus,
    }));
  };

  const removeClient = () => {
    setCart((prev) => ({
      ...prev,
      client: null,
    }));
  };

  const clearCart = () => {
    setCart(defaultCartState);
  };

  const updateNotes = (notes: string) => {
    setCart((prev) => ({
      ...prev,
      notes,
    }));
  };

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    addClient,
    removeClient,
    clearCart,
    updateNotes,
  };
}
