
import { useItemMutations } from './mutations/use-item-mutations';
import { useItemAddRemove } from './mutations/use-item-add-remove';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';

export function usePurchaseItems(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void,
  refetch: () => Promise<any>
) {
  const { updateItemQuantity, updateItemPrice } = useItemMutations(
    orderId,
    orderItems,
    setOrderItems
  );

  const { removeItem, addItem } = useItemAddRemove(
    orderId,
    orderItems,
    setOrderItems
  );

  return {
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    addItem
  };
}
