
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "../useStockMovementTypes";
import { db } from "@/utils/db-core";

export async function createStockEntryInDb(data: StockEntryForm): Promise<boolean> {
  try {
    if (!data.warehouseId || !data.productId) {
      throw new Error("L'entrepôt et le produit sont obligatoires");
    }
    
    if (data.quantity <= 0) {
      throw new Error("La quantité doit être positive");
    }
    
    const totalValue = data.quantity * data.unitPrice;
    
    console.log(`Création d'une entrée stock pour le produit ${data.productId} dans l'entrepôt ${data.warehouseId} - Quantité: ${data.quantity}, Prix unitaire: ${data.unitPrice}, Valeur totale: ${totalValue}`);
    
    // 1. Insert the stock movement
    const { data: movementData, error: movementError } = await supabase
      .from('warehouse_stock_movements')
      .insert({
        warehouse_id: data.warehouseId,
        product_id: data.productId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
        total_value: totalValue,
        type: 'in',
        reason: data.reason
      })
      .select();

    if (movementError) {
      console.error("Error creating movement:", movementError);
      throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
    }
    
    console.log("Successfully created stock movement:", movementData);
    
    // 2. Détecter le type d'emplacement (entrepôt ou PDV)
    const locationInfo = await getLocationInfo(data.warehouseId);
    console.log("Location info:", locationInfo);
    
    // 3. Mettre à jour la table warehouse_stock
    await updateWarehouseStock(data, totalValue, locationInfo);

    // 4. Mettre à jour le stock du catalogue
    await updateCatalogStock(data);
    
    // 5. Mettre à jour stock_principal
    await updateStockPrincipal(data, totalValue, locationInfo);

    return true;
  } catch (error: any) {
    console.error("Error in createStockEntryInDb:", error);
    throw error;
  }
}

async function getLocationInfo(locationId: string): Promise<{ isWarehouse: boolean; isPOS: boolean; name: string; }> {
  try {
    // Vérifier d'abord dans warehouses
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('id', locationId)
      .maybeSingle();
    
    if (warehouseData) {
      console.log("Found warehouse:", warehouseData);
      return { isWarehouse: true, isPOS: false, name: warehouseData.name };
    }
    
    // Vérifier ensuite dans pos_locations
    const { data: posData, error: posError } = await supabase
      .from('pos_locations')
      .select('id, name')
      .eq('id', locationId)
      .maybeSingle();
    
    if (posData) {
      console.log("Found POS location:", posData);
      return { isWarehouse: false, isPOS: true, name: posData.name };
    }
    
    console.warn(`Location ${locationId} not found in warehouses or pos_locations`);
    return { isWarehouse: true, isPOS: false, name: 'Entrepôt inconnu' };
  } catch (error) {
    console.error("Error getting location info:", error);
    return { isWarehouse: true, isPOS: false, name: 'Entrepôt inconnu' };
  }
}

async function updateWarehouseStock(data: StockEntryForm, totalValue: number, locationInfo: { isWarehouse: boolean; isPOS: boolean; name: string; }): Promise<void> {
  try {
    console.log("Updating warehouse stock with data:", { data, totalValue, locationInfo });
    
    // Construire la requête selon le type d'emplacement
    let query = supabase
      .from('warehouse_stock')
      .select('id, quantity, unit_price, total_value')
      .eq('product_id', data.productId);
    
    if (locationInfo.isWarehouse) {
      query = query.eq('warehouse_id', data.warehouseId).is('pos_location_id', null);
    } else {
      query = query.eq('pos_location_id', data.warehouseId).is('warehouse_id', null);
    }
    
    const { data: existingStock, error: stockCheckError } = await query.maybeSingle();
    
    if (stockCheckError) {
      console.error("Error checking existing stock:", stockCheckError);
      throw new Error(`Erreur lors de la vérification du stock: ${stockCheckError.message}`);
    }
    
    if (existingStock) {
      // Mise à jour avec calcul de prix moyen pondéré
      const newQuantity = existingStock.quantity + data.quantity;
      const oldValue = existingStock.quantity * existingStock.unit_price;
      const newValue = data.quantity * data.unitPrice;
      const newTotalValue = oldValue + newValue;
      const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : data.unitPrice;
      
      console.log("Updating existing warehouse stock:", {
        id: existingStock.id,
        oldQuantity: existingStock.quantity,
        newQuantity,
        oldUnitPrice: existingStock.unit_price,
        newUnitPrice,
        newTotalValue
      });
      
      const { data: updateResult, error: updateError } = await supabase
        .from('warehouse_stock')
        .update({
          quantity: newQuantity,
          unit_price: newUnitPrice,
          total_value: newTotalValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStock.id)
        .select();
        
      if (updateError) {
        console.error("Error updating warehouse stock:", updateError);
        throw new Error("Erreur lors de la mise à jour du stock");
      }
      
      console.log("Warehouse stock updated successfully:", updateResult);
    } else {
      // Créer une nouvelle entrée
      const stockData: any = {
        product_id: data.productId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
        total_value: totalValue
      };
      
      if (locationInfo.isWarehouse) {
        stockData.warehouse_id = data.warehouseId;
        stockData.pos_location_id = null;
      } else {
        stockData.pos_location_id = data.warehouseId;
        stockData.warehouse_id = null;
      }
      
      console.log("Creating new warehouse stock entry:", stockData);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('warehouse_stock')
        .insert(stockData)
        .select();
        
      if (insertError) {
        console.error("Error creating warehouse stock:", insertError);
        throw new Error("Erreur lors de la création du stock");
      }
      
      console.log("New warehouse stock entry created successfully:", insertResult);
    }
  } catch (error) {
    console.error("Error in updateWarehouseStock:", error);
    throw error;
  }
}

async function updateCatalogStock(data: StockEntryForm): Promise<void> {
  try {
    // Récupérer le stock actuel du catalogue
    const { data: productData, error: productError } = await supabase
      .from('catalog')
      .select('stock')
      .eq('id', data.productId)
      .single();

    if (productError) {
      console.error("Error getting current product stock:", productError);
      throw productError;
    }

    // Calculer le nouveau stock
    const currentStock = productData?.stock || 0;
    const newStock = currentStock + data.quantity;
    console.log(`Updating catalog product ${data.productId} stock from ${currentStock} to ${newStock}`);

    // Mettre à jour le stock du catalogue
    const { data: updateResult, error: updateError } = await supabase
      .from('catalog')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.productId)
      .select();

    if (updateError) {
      console.error("Error updating catalog product stock:", updateError);
      throw new Error("Erreur lors de la mise à jour du stock du produit");
    }
        
    console.log(`Updated catalog product stock from ${currentStock} to ${newStock}:`, updateResult);
  } catch (err) {
    console.error("Error updating catalog product stock:", err);
    throw new Error(`Erreur lors de la mise à jour du stock du produit: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function updateStockPrincipal(data: StockEntryForm, totalValue: number, locationInfo: { isWarehouse: boolean; isPOS: boolean; name: string; }): Promise<void> {
  try {
    // Récupérer le nom du produit
    const { data: productData, error: productError } = await supabase
      .from('catalog')
      .select('name')
      .eq('id', data.productId)
      .single();
      
    if (productError) {
      console.error("Error getting product name for stock_principal:", productError);
      throw productError;
    }
    
    const productName = productData.name;
    const locationName = locationInfo.name;
    
    console.log("Updating stock_principal for:", { productName, locationName, quantity: data.quantity });
    
    // Vérifier si une entrée existe déjà dans stock_principal
    const { data: existingEntry, error: checkError } = await supabase
      .from('stock_principal')
      .select('id, quantite, prix_unitaire, valeur_totale')
      .eq('article', productName)
      .eq('entrepot', locationName)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing stock_principal entry:", checkError);
      throw checkError;
    }
    
    if (existingEntry) {
      // Mettre à jour l'entrée existante avec calcul de moyenne pondérée
      const newQuantity = existingEntry.quantite + data.quantity;
      const oldValue = existingEntry.quantite * existingEntry.prix_unitaire;
      const newValue = data.quantity * data.unitPrice;
      const newTotalValue = oldValue + newValue;
      const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : data.unitPrice;
      
      console.log("Updating existing stock_principal entry:", {
        id: existingEntry.id,
        article: productName,
        entrepot: locationName,
        oldQuantity: existingEntry.quantite,
        newQuantity,
        oldUnitPrice: existingEntry.prix_unitaire,
        newUnitPrice,
        newTotalValue
      });
      
      const { data: updateResult, error: updateError } = await supabase
        .from('stock_principal')
        .update({
          quantite: newQuantity,
          prix_unitaire: newUnitPrice,
          valeur_totale: newTotalValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id)
        .select();
      
      if (updateError) {
        console.error("Error updating stock_principal:", updateError);
        throw new Error("Erreur lors de la mise à jour du stock principal");
      }
      
      console.log("stock_principal successfully updated:", updateResult);
    } else {
      // Créer une nouvelle entrée
      console.log("Creating new stock_principal entry:", {
        article: productName,
        entrepot: locationName,
        quantite: data.quantity,
        prix_unitaire: data.unitPrice,
        valeur_totale: totalValue
      });
      
      const { data: insertResult, error: insertError } = await supabase
        .from('stock_principal')
        .insert({
          article: productName,
          entrepot: locationName,
          quantite: data.quantity,
          prix_unitaire: data.unitPrice,
          valeur_totale: totalValue,
          categorie_action: 'Entrée automatique'
        })
        .select();
      
      if (insertError) {
        console.error("Error creating stock_principal entry:", insertError);
        throw new Error("Erreur lors de la création de l'entrée dans le stock principal");
      }
      
      console.log("New stock_principal entry successfully created:", insertResult);
    }
  } catch (err) {
    console.error("Error updating stock_principal:", err);
    throw new Error(`Erreur lors de la mise à jour du stock principal: ${err instanceof Error ? err.message : String(err)}`);
  }
}
