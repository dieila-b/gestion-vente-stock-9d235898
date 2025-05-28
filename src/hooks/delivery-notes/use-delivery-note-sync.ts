
import { syncApprovedPurchaseOrders } from "./sync/sync-approved-purchase-orders";

export function useDeliveryNoteSync() {
  const syncFromApprovedOrders = async (refetch: () => void) => {
    console.log("Manually syncing from approved orders");
    const result = await syncApprovedPurchaseOrders();
    if (result) {
      await refetch();
    }
    return result;
  };

  return {
    syncFromApprovedOrders
  };
}
