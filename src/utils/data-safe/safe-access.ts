
// Enhanced safe access utilities with proper TypeScript types

export function safeGet<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const value = obj[key];
  return value !== undefined && value !== null ? value : defaultValue;
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
}

export function safeString(value: any, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value !== undefined && value !== null) return String(value);
  return defaultValue;
}

export function safeArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  return [];
}

export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  return defaultValue;
}

// Add the missing export
export function isSelectQueryError(error: any): boolean {
  return error && typeof error === 'object' && 'message' in error;
}

// Type guards for better type safety
export function isValidObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function hasProperty<T extends PropertyKey>(
  obj: any, 
  prop: T
): obj is Record<T, any> {
  return isValidObject(obj) && prop in obj;
}

// Enhanced safe access with type checking
export function safeCatalogProduct(product: any) {
  if (!isValidObject(product)) return null;
  
  return {
    id: safeString(product.id),
    name: safeString(product.name),
    price: safeNumber(product.price),
    purchase_price: safeNumber(product.purchase_price),
    stock: safeNumber(product.stock),
    category: safeString(product.category),
    reference: safeString(product.reference),
    description: safeString(product.description),
    image_url: safeString(product.image_url)
  };
}

export function safeSupplier(supplier: any) {
  if (!isValidObject(supplier)) return null;
  
  return {
    id: safeString(supplier.id),
    name: safeString(supplier.name),
    contact: safeString(supplier.contact),
    email: safeString(supplier.email),
    phone: safeString(supplier.phone),
    address: safeString(supplier.address),
    website: safeString(supplier.website),
    status: safeString(supplier.status, 'pending')
  };
}

export function safeOrder(order: any) {
  if (!isValidObject(order)) return null;
  
  return {
    id: safeString(order.id),
    client_id: safeString(order.client_id),
    total: safeNumber(order.total),
    final_total: safeNumber(order.final_total),
    paid_amount: safeNumber(order.paid_amount),
    remaining_amount: safeNumber(order.remaining_amount),
    status: safeString(order.status),
    payment_status: safeString(order.payment_status),
    delivery_status: safeString(order.delivery_status),
    order_items: safeArray(order.order_items)
  };
}

export function safeOrderItem(item: any) {
  if (!isValidObject(item)) return null;
  
  return {
    id: safeString(item.id),
    product_id: safeString(item.product_id),
    quantity: safeNumber(item.quantity),
    price: safeNumber(item.price),
    total: safeNumber(item.total)
  };
}
