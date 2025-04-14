
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
    // Lors de l'enregistrement final, utiliser 1 comme valeur par défaut si quantity est 0
    const finalQuantity = quantity === 0 ? 0 : quantity;
    
    setOrderItems(
      orderItems.map((item, idx) => {
        if (idx === index) {
          const newItem = { ...item, quantity: finalQuantity };
          // Mettre à jour le prix total seulement si la quantité n'est pas 0
          if (finalQuantity > 0) {
            newItem.total_price = item.unit_price * finalQuantity;
          }
          return newItem;
        }
        return item;
      })
    );
  };

  const updateProductPrice = (index: number, price: number) => {
    const newPrice = Math.max(0, price); // Ensure price is not negative
    setOrderItems(
      orderItems.map((item, idx) => {
        if (idx === index) {
          // Utiliser 1 comme quantité par défaut si la quantité est 0 pour le calcul du total
          const effectiveQuantity = item.quantity || 1;
          return { 
            ...item, 
            unit_price: newPrice, 
            total_price: newPrice * effectiveQuantity 
          };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      // S'assurer qu'on n'additionne que pour les produits avec quantité > 0
      const itemTotal = item.quantity > 0 ? item.total_price : 0;
      return sum + itemTotal;
    }, 0);
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
