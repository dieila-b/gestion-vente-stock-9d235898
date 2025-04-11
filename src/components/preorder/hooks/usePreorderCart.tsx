
import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types/pos';
import { Client } from '@/types/client';
import { toast } from 'sonner';

export function usePreorderCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('preorderCart');
    const savedClient = localStorage.getItem('preorderClient');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('preorderCart');
      }
    }
    
    if (savedClient) {
      try {
        setSelectedClient(JSON.parse(savedClient));
      } catch (error) {
        console.error('Error parsing saved client:', error);
        localStorage.removeItem('preorderClient');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('preorderCart', JSON.stringify(cart));
  }, [cart]);
  
  // Save selected client to localStorage whenever it changes
  useEffect(() => {
    if (selectedClient) {
      localStorage.setItem('preorderClient', JSON.stringify(selectedClient));
    }
  }, [selectedClient]);
  
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity if product already exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        toast.success(`Quantité mise à jour: ${product.name}`);
        return updatedCart;
      } else {
        // Add new product to cart
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          category: product.category,
          reference: product.reference,
          image_url: product.image_url
        };
        toast.success(`Produit ajouté: ${product.name}`);
        return [...prevCart, newItem];
      }
    });
  };
  
  const removeFromCart = (id: string) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.id === id);
      if (item) {
        toast.info(`Produit retiré: ${item.name}`);
      }
      return prevCart.filter(item => item.id !== id);
    });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('preorderCart');
    toast.info("Panier vidé");
  };
  
  const selectClient = (client: Client) => {
    setSelectedClient(client);
  };
  
  return {
    cart,
    selectedClient,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectClient
  };
}
