
import { useState } from "react";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
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

  const removeProductFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    setOrderItems(
      orderItems.map((item, idx) => 
        idx === index 
          ? { ...item, quantity, total_price: item.unit_price * quantity } 
          : item
      )
    );
  };

  const updateProductPrice = (index: number, price: number) => {
    setOrderItems(
      orderItems.map((item, idx) => 
        idx === index 
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
