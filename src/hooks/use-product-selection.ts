
import { useState } from "react";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { CatalogProduct } from "@/types/catalog";
import { useProducts } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";

export const useProductSelection = () => {
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch products
  const { products } = useProducts();

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addProductToOrder = (product: CatalogProduct) => {
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product_code: product.reference || "",
      designation: product.name,
      quantity: 1,
      unit_price: product.purchase_price || 0,
      selling_price: product.price,
      total_price: product.purchase_price || 0
    };
    
    setOrderItems([...orderItems, newItem]);
    setShowProductModal(false);
  };

  const removeProductFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setOrderItems(
      orderItems.map(item => 
        item.id === productId 
          ? { ...item, quantity, total_price: item.unit_price * quantity } 
          : item
      )
    );
  };

  const updateProductPrice = (productId: string, price: number) => {
    setOrderItems(
      orderItems.map(item => 
        item.id === productId 
          ? { ...item, unit_price: price, total_price: price * item.quantity } 
          : item
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  return {
    orderItems,
    setOrderItems,
    showProductModal,
    setShowProductModal,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    addProductToOrder,
    removeProductFromOrder,
    updateProductQuantity,
    updateProductPrice,
    calculateTotal
  };
};
