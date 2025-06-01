
import { safeArray, safeNumber, safeOrder, safeOrderItem, safeCatalogProduct } from "@/utils/data-safe/safe-access";

export function useDailyMarginCalculation(todayOrderData: any[], catalogProducts: any[]) {
  const calculateDailyMargin = () => {
    try {
      const safeOrders = safeArray(todayOrderData);
      const safeProducts = safeArray(catalogProducts);
      
      if (safeOrders.length === 0 || safeProducts.length === 0) return 0;
      
      let totalMargin = 0;
      
      safeOrders.forEach(orderData => {
        const order = safeOrder(orderData);
        if (!order) return;
        
        const orderItems = safeArray(order.order_items);
        
        orderItems.forEach(itemData => {
          const item = safeOrderItem(itemData);
          if (!item) return;
          
          const catalogProductData = safeProducts.find(p => {
            const product = safeCatalogProduct(p);
            return product && product.id === item.product_id;
          });
          const catalogProduct = safeCatalogProduct(catalogProductData);
          if (!catalogProduct) return;
          
          const salesPrice = safeNumber(catalogProduct.price);
          const purchasePrice = safeNumber(catalogProduct.purchase_price);
          const quantity = safeNumber(item.quantity);
          
          totalMargin += (salesPrice - purchasePrice) * quantity;
        });
      });
      
      return totalMargin;
    } catch (error) {
      console.error("Erreur dans calculateDailyMargin:", error);
      return 0;
    }
  };

  return { calculateDailyMargin };
}
