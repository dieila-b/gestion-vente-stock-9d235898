
// Export all data safety utilities from this index file
export * from './safe-access';
// Export safe entities without duplicates
export { safeBankAccount } from './entities/bank-account';
export { safeClient } from './entities/client';
export { safeDeliveryNote } from './entities/delivery-note';
export { safeInvoice } from './entities/invoice';
export { safePosLocation } from './entities/pos-location';
export { safeProduct } from './entities/product';
export { safeWarehouse } from './entities/warehouse';
export * from './safe-query';

// Note: safeSupplier is already exported from safe-access, so we don't re-export it here
