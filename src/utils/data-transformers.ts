
import { POSLocation } from "@/types/pos-locations";
import { safeGet, safePOSLocation } from "@/utils/select-query-helper";

// Safe transformer for POS locations
export function transformPOSLocation(item: any): POSLocation {
  return {
    id: safeGet(item, 'id', ''),
    name: safeGet(item, 'name', 'Location non disponible'),
    phone: safeGet(item, 'phone', ''),
    email: safeGet(item, 'email', ''),
    address: safeGet(item, 'address', ''),
    status: safeGet(item, 'status', 'inactive'),
    is_active: safeGet(item, 'is_active', false),
    manager: safeGet(item, 'manager', ''),
    capacity: safeGet(item, 'capacity', 0),
    occupied: safeGet(item, 'occupied', 0),
    surface: safeGet(item, 'surface', 0),
    created_at: safeGet(item, 'created_at', ''),
    updated_at: safeGet(item, 'updated_at', null)
  };
}

// Map an array of POS locations safely
export function transformPOSLocations(items: any[]): POSLocation[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => safePOSLocation(item));
}
