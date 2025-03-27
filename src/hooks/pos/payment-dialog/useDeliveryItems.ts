
import { useState, useCallback } from "react";

interface DeliveryItemsState {
  [key: string]: {
    delivered: boolean;
    quantity: number;
  };
}

export function useDeliveryItems() {
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItemsState>({});

  const handleDeliveredChange = useCallback((checked: boolean, itemId: string) => {
    setDeliveryItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        delivered: checked
      }
    }));
  }, []);

  const handleQuantityChange = useCallback((quantity: number, itemId: string) => {
    setDeliveryItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity
      }
    }));
  }, []);

  const initializeDeliveryItems = useCallback((items: any[], fullyDeliveredByDefault: boolean = false) => {
    const initialState: DeliveryItemsState = {};
    
    items.forEach(item => {
      initialState[item.id] = {
        delivered: fullyDeliveredByDefault,
        quantity: item.quantity
      };
    });
    
    setDeliveryItems(initialState);
  }, []);

  const resetDeliveryItems = useCallback(() => {
    setDeliveryItems({});
  }, []);

  return {
    deliveryItems,
    setDeliveryItems,
    handleDeliveredChange,
    handleQuantityChange,
    initializeDeliveryItems,
    resetDeliveryItems
  };
}
