
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';
import { toast } from 'sonner';

export function usePreorderActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add an item to the cart
  const addToCart = (
    cart: CartItem[],
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    product: any,
    quantity: number = 1
  ) => {
    // Check if product already exists in the cart
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);

    if (existingProductIndex >= 0) {
      // Update quantity if product already exists
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      // Add new product to cart
      const newCartItem: CartItem = {
        id: product.id,
        name: product.name,
        reference: product.reference,
        quantity,
        price: product.price,
        category: product.category,
        discount: 0,
        discounted_price: product.price,
        original_price: product.price,
        stock: product.stock,
        // Add these properties to avoid type errors
        unit_price: product.price,
        total: product.price * quantity
      };
      setCart([...cart, newCartItem]);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (
    cart: CartItem[],
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    productId: string
  ) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Update quantity of a cart item
  const updateQuantity = (
    cart: CartItem[],
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    productId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(cart, setCart, productId);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    setCart(updatedCart);
  };

  // Update discount of a cart item
  const updateDiscount = (
    cart: CartItem[],
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    productId: string,
    discount: number
  ) => {
    const updatedCart = cart.map((item) => {
      if (item.id === productId) {
        return {
          ...item,
          discount,
          discounted_price: item.price * (1 - discount / 100),
          total: item.quantity * (item.price * (1 - discount / 100))
        };
      }
      return item;
    });

    setCart(updatedCart);
  };

  // Set cart item quantity directly
  const setCartItemQuantity = (
    cart: CartItem[],
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    productId: string,
    quantity: number
  ) => {
    updateQuantity(cart, setCart, productId, quantity);
  };

  // Clear the cart
  const clearCart = (setCart: React.Dispatch<React.SetStateAction<CartItem[]>>) => {
    setCart([]);
  };

  // Save preorder to database
  const validatePreorder = async (
    client: Client | null,
    cart: CartItem[],
    notes: string = ""
  ) => {
    if (!client) {
      toast.error("Veuillez sélectionner un client");
      return null;
    }

    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return null;
    }

    setIsSubmitting(true);

    try {
      // Calculate totals
      const totalAmount = cart.reduce((sum, item) => sum + item.quantity * (item.discounted_price || item.price), 0);

      // Create preorder
      const { data: preorderData, error: preorderError } = await supabase
        .from('preorders')
        .insert({
          client_id: client.id,
          status: 'pending',
          notes,
          total_amount: totalAmount,
          paid_amount: 0,
          remaining_amount: totalAmount
        })
        .select()
        .single();

      if (preorderError) throw preorderError;

      // Create preorder items
      const preorderItems = cart.map(item => ({
        preorder_id: preorderData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.discounted_price || item.price,
        total_price: item.quantity * (item.discounted_price || item.price),
        status: 'pending'
      }));

      const { error: itemsError } = await supabase
        .from('preorder_items')
        .insert(preorderItems);

      if (itemsError) throw itemsError;

      toast.success("Précommande enregistrée avec succès");
      return preorderData;
    } catch (error) {
      console.error('Error creating preorder:', error);
      toast.error("Erreur lors de la création de la précommande");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    clearCart,
    setCartItemQuantity,
    validatePreorder,
    isSubmitting,
  };
}
