
import { useState } from "react";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { CatalogProduct } from "@/types/catalog";
import { useProducts } from "@/hooks/use-products";

export const useProductSelection = () => {
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch products
  const { products } = useProducts();

  const filteredProducts = products.filter(
    (product) => {
      // Safely check for product name and reference properties
      const productName = product.name || "";
      const productReference = product.reference || "";
      const query = searchQuery.toLowerCase();
      
      return productName.toLowerCase().includes(query) || 
             productReference.toLowerCase().includes(query);
    }
  );

  const addProductToOrder = (product: PurchaseOrderItem) => {
    setOrderItems([...orderItems, product]);
  };

  const removeProductFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    const newQuantity = Math.max(1, quantity); // Ensure quantity is at least 1
    setOrderItems(
      orderItems.map((item, idx) => 
        idx === index 
          ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity } 
          : item
      )
    );
  };

  const updateProductPrice = (index: number, price: number) => {
    const newPrice = Math.max(0, price); // Ensure price is not negative
    setOrderItems(
      orderItems.map((item, idx) => 
        idx === index 
          ? { ...item, unit_price: newPrice, total_price: newPrice * item.quantity } 
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
