
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test product if none exists
 */
export async function ensureTestProduct() {
  const { data: existingProducts } = await supabase
    .from('catalog')
    .select('id, name, price')
    .limit(1);

  if (existingProducts && existingProducts.length > 0) {
    console.log("Using existing product:", existingProducts[0]);
    return existingProducts[0];
  }

  // Create a test product if none exists
  const { data: newProduct, error } = await supabase
    .from('catalog')
    .insert({
      name: 'Produit Test',
      reference: 'TEST001',
      price: 15000,
      purchase_price: 10000,
      category: 'Test',
      stock: 100
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating test product:", error);
    return null;
  }

  console.log("Created test product:", newProduct);
  return newProduct;
}

/**
 * Creates a test warehouse if none exists
 */
export async function ensureTestWarehouse() {
  const { data: existingWarehouses } = await supabase
    .from('warehouses')
    .select('id, name')
    .limit(1);

  if (existingWarehouses && existingWarehouses.length > 0) {
    console.log("Using existing warehouse:", existingWarehouses[0]);
    return existingWarehouses[0];
  }

  // Create a test warehouse if none exists
  const { data: newWarehouse, error } = await supabase
    .from('warehouses')
    .insert({
      name: 'Entrepôt Principal',
      location: 'Conakry',
      status: 'Actif'
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating test warehouse:", error);
    return null;
  }

  console.log("Created test warehouse:", newWarehouse);
  return newWarehouse;
}

/**
 * Creates a test stock entry if none exists
 */
export async function createTestStockEntry(productId: string, warehouseId: string) {
  // First, check if the entry already exists
  const { data: existingEntry } = await supabase
    .from('warehouse_stock')
    .select('id')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .maybeSingle();

  if (existingEntry) {
    console.log("Stock entry already exists:", existingEntry);
    return existingEntry;
  }

  // Create the stock entry
  const { data: stockEntry, error } = await supabase
    .from('warehouse_stock')
    .insert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: 50,
      unit_price: 15000,
      total_value: 750000
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating test stock entry:", error);
    return null;
  }

  console.log("Created test stock entry:", stockEntry);
  
  // Create a corresponding stock movement
  const { error: movementError } = await supabase
    .rpc('bypass_insert_stock_movement', {
      warehouse_id: warehouseId,
      product_id: productId,
      quantity: 50,
      unit_price: 15000,
      total_value: 750000,
      movement_type: 'in',
      reason: 'Initialisation du stock'
    });

  if (movementError) {
    console.error("Error creating stock movement:", movementError);
  }

  return stockEntry;
}
