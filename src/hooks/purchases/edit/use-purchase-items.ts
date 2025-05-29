
import { useItemMutations } from './mutations/use-item-mutations';
import { useItemAddRemove } from './mutations/use-item-add-remove';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';

export function usePurchaseItems(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void,
  refetch: () => Promise<any>,
  calculateTotals?: () => void
) {
  const { updateItemQuantity, updateItemPrice } = useItemMutations(
    orderId,
    orderItems,
    setOrderItems,
    calculateTotals
  );

  const { removeItem, addItem } = useItemAddRemove(
    orderId,
    orderItems,
    setOrderItems
  );

  // Wrap addItem to trigger totals calculation
  const addItemWithTotals = async (product: CatalogProduct): Promise<boolean> => {
    const result = await addItem(product);
    if (result && calculateTotals) {
      setTimeout(calculateTotals, 100);
    }
    return result;
  };

  // Wrap removeItem to trigger totals calculation
  const removeItemWithTotals = async (itemId: string): Promise<boolean> => {
    const result = await removeItem(itemId);
    if (result && calculateTotals) {
      setTimeout(calculateTotals, 100);
    }
    return result;
  };

  return {
    updateItemQuantity,
    updateItemPrice,
    removeItem: removeItemWithTotals,
    addItem: addItemWithTotals
  };
}
