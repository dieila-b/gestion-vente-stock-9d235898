
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

export const stockOperationsService = {
  async updateStockForLocation(
    productId: string,
    quantity: number,
    unitPrice: number,
    selectedLocationId: string,
    warehouses: any[],
    posLocations: any[],
    deliveryNumber: string
  ) {
    if (quantity <= 0) return;

    try {
      // Determine location type
      const isWarehouse = warehouses.some(w => w.id === selectedLocationId);
      
      // 1. Create stock movement
      const movementData: any = {
        product_id: productId,
        quantity: quantity,
        unit_price: unitPrice,
        total_value: quantity * unitPrice,
        type: 'in',
        reason: `Réception bon de livraison ${deliveryNumber}`
      };

      if (isWarehouse) {
        movementData.warehouse_id = selectedLocationId;
      } else {
        // For POS, use default warehouse since FK only accepts warehouses
        const defaultWarehouse = warehouses[0];
        if (defaultWarehouse) {
          movementData.warehouse_id = defaultWarehouse.id;
          movementData.reason = `${movementData.reason} (PDV: ${posLocations.find(p => p.id === selectedLocationId)?.name || 'PDV'})`;
        }
      }

      const { error: movementError } = await supabase
        .from('warehouse_stock_movements')
        .insert(movementData);

      if (movementError) throw movementError;

      // 2. Update warehouse_stock
      const stockQuery = supabase
        .from('warehouse_stock')
        .select('id, quantity, unit_price, total_value')
        .eq('product_id', productId);

      if (isWarehouse) {
        stockQuery.eq('warehouse_id', selectedLocationId).is('pos_location_id', null);
      } else {
        stockQuery.eq('pos_location_id', selectedLocationId).is('warehouse_id', null);
      }

      const { data: existingStock, error: stockCheckError } = await stockQuery.maybeSingle();

      if (stockCheckError) throw stockCheckError;

      if (existingStock) {
        // Update with weighted average price calculation
        const newQuantity = existingStock.quantity + quantity;
        const oldValue = existingStock.quantity * existingStock.unit_price;
        const newValue = quantity * unitPrice;
        const newTotalValue = oldValue + newValue;
        const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : unitPrice;

        const { error: updateError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            unit_price: newUnitPrice,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);

        if (updateError) throw updateError;
      } else {
        // Create new entry
        const stockData: any = {
          product_id: productId,
          quantity: quantity,
          unit_price: unitPrice,
          total_value: quantity * unitPrice
        };

        if (isWarehouse) {
          stockData.warehouse_id = selectedLocationId;
          stockData.pos_location_id = null;
        } else {
          stockData.pos_location_id = selectedLocationId;
          stockData.warehouse_id = null;
        }

        const { error: insertError } = await supabase
          .from('warehouse_stock')
          .insert(stockData);

        if (insertError) throw insertError;
      }

      // 3. Update catalog stock
      const { data: productData, error: productError } = await supabase
        .from('catalog')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const newCatalogStock = (productData?.stock || 0) + quantity;
      const { error: catalogUpdateError } = await supabase
        .from('catalog')
        .update({ 
          stock: newCatalogStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (catalogUpdateError) throw catalogUpdateError;

    } catch (error: any) {
      console.error('Stock update error:', error);
      throw new Error(`Erreur lors de la mise à jour du stock: ${error.message}`);
    }
  }
};
