
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
    
    // 1. Insert the stock movement - Use direct insert instead of RPC to avoid column ambiguity
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
    
    // 2. Check if stock exists for this product in this warehouse
    const { data: existingStock, error: stockCheckError } = await supabase
      .from('warehouse_stock')
      .select('id, quantity, unit_price, total_value')
      .eq('warehouse_id', data.warehouseId)
      .eq('product_id', data.productId)
      .maybeSingle();
    
    if (stockCheckError) {
      console.error("Error checking existing stock:", stockCheckError);
      throw new Error(`Erreur lors de la vérification du stock: ${stockCheckError.message}`);
    }
    
    // 3. Update or create stock entry using db utility to bypass RLS
    if (existingStock) {
      await updateExistingStock(existingStock, data);
    } else {
      await createNewStock(data, totalValue);
    }

    // 4. Update the catalog product stock total
    await updateCatalogStock(data);
    
    // 5. Update or create record in stock_principal table
    await updateStockPrincipal(data, totalValue);

    return true;
  } catch (error: any) {
    console.error("Error in createStockEntryInDb:", error);
    throw error;
  }
}

async function updateExistingStock(existingStock: any, data: StockEntryForm): Promise<void> {
  // Calculate new values for existing stock (weighted average)
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
    oldTotalValue: existingStock.total_value,
    newTotalValue
  });
  
  // Update existing stock using db.update to bypass RLS
  const updateResult = await db.update(
    'warehouse_stock',
    {
      quantity: newQuantity,
      unit_price: newUnitPrice,
      total_value: newTotalValue,
      updated_at: new Date().toISOString()
    },
    'id',
    existingStock.id
  );
    
  if (!updateResult) {
    console.error("Error updating stock using db utility");
    throw new Error("Erreur lors de la mise à jour du stock");
  }
  
  console.log("Stock successfully updated using db utility");
}

async function createNewStock(data: StockEntryForm, totalValue: number): Promise<void> {
  // Create new stock entry using db.insert to bypass RLS
  console.log("Creating new warehouse stock entry:", {
    warehouseId: data.warehouseId,
    productId: data.productId,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalValue
  });
  
  const insertResult = await db.insert('warehouse_stock', {
    warehouse_id: data.warehouseId,
    product_id: data.productId,
    quantity: data.quantity,
    unit_price: data.unitPrice,
    total_value: totalValue
  });
    
  if (!insertResult) {
    console.error("Error creating stock using db utility");
    throw new Error("Erreur lors de la création du stock");
  }
  
  console.log("New stock entry successfully created using db utility");
}

async function updateCatalogStock(data: StockEntryForm): Promise<void> {
  try {
    // First, get current stock value from catalog
    const { data: productData, error: productError } = await supabase
      .from('catalog')
      .select('stock')
      .eq('id', data.productId)
      .single();

    if (productError) {
      console.error("Error getting current product stock:", productError);
      throw productError;
    }

    // Calculate new stock value
    const currentStock = productData?.stock || 0;
    const newStock = currentStock + data.quantity;
    console.log(`Updating catalog product ${data.productId} stock from ${currentStock} to ${newStock}`);

    // Update the catalog stock using db.update to bypass RLS
    const updateCatalogResult = await db.update(
      'catalog',
      { 
        stock: newStock,
        updated_at: new Date().toISOString()
      },
      'id',
      data.productId
    );

    if (!updateCatalogResult) {
      console.error("Error updating catalog product stock with db utility");
      throw new Error("Erreur lors de la mise à jour du stock du produit");
    }
        
    console.log(`Updated catalog product stock from ${currentStock} to ${newStock}`);
  } catch (err) {
    console.error("Error updating catalog product stock:", err);
    throw new Error(`Erreur lors de la mise à jour du stock du produit: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function updateStockPrincipal(data: StockEntryForm, totalValue: number): Promise<void> {
  try {
    // Récupérer les informations du produit et de l'entrepôt pour stock_principal
    const { data: productData, error: productError } = await supabase
      .from('catalog')
      .select('name')
      .eq('id', data.productId)
      .single();
      
    if (productError) {
      console.error("Error getting product name for stock_principal:", productError);
      throw productError;
    }
    
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('name')
      .eq('id', data.warehouseId)
      .single();
      
    if (warehouseError) {
      console.error("Error getting warehouse name for stock_principal:", warehouseError);
      throw warehouseError;
    }
    
    const productName = productData.name;
    const warehouseName = warehouseData.name;
    
    // Vérifier si une entrée existe déjà dans stock_principal
    const { data: existingEntry, error: checkError } = await supabase
      .from('stock_principal')
      .select('id, quantite, prix_unitaire, valeur_totale')
      .eq('article', productName)
      .eq('entrepot', warehouseName)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing stock_principal entry:", checkError);
      throw checkError;
    }
    
    if (existingEntry) {
      // Mettre à jour l'entrée existante (calcul de moyenne pondérée)
      const newQuantity = existingEntry.quantite + data.quantity;
      const oldValue = existingEntry.quantite * existingEntry.prix_unitaire;
      const newValue = data.quantity * data.unitPrice;
      const newTotalValue = oldValue + newValue;
      const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : data.unitPrice;
      
      console.log("Updating existing stock_principal entry:", {
        id: existingEntry.id,
        article: productName,
        entrepot: warehouseName,
        oldQuantity: existingEntry.quantite,
        newQuantity,
        oldUnitPrice: existingEntry.prix_unitaire,
        newUnitPrice,
        oldTotalValue: existingEntry.valeur_totale,
        newTotalValue
      });
      
      const updateResult = await db.update(
        'stock_principal',
        {
          quantite: newQuantity,
          prix_unitaire: newUnitPrice,
          valeur_totale: newTotalValue,
          updated_at: new Date().toISOString()
        },
        'id',
        existingEntry.id
      );
      
      if (!updateResult) {
        console.error("Error updating stock_principal using db utility");
        throw new Error("Erreur lors de la mise à jour du stock principal");
      }
      
      console.log("stock_principal successfully updated");
    } else {
      // Créer une nouvelle entrée
      console.log("Creating new stock_principal entry:", {
        article: productName,
        entrepot: warehouseName,
        quantite: data.quantity,
        prix_unitaire: data.unitPrice,
        valeur_totale: totalValue
      });
      
      const insertResult = await db.insert('stock_principal', {
        article: productName,
        entrepot: warehouseName,
        quantite: data.quantity,
        prix_unitaire: data.unitPrice,
        valeur_totale: totalValue,
        categorie_action: 'Entrée automatique'
      });
      
      if (!insertResult) {
        console.error("Error creating stock_principal entry using db utility");
        throw new Error("Erreur lors de la création de l'entrée dans le stock principal");
      }
      
      console.log("New stock_principal entry successfully created");
    }
  } catch (err) {
    console.error("Error updating stock_principal:", err);
    throw new Error(`Erreur lors de la mise à jour du stock principal: ${err instanceof Error ? err.message : String(err)}`);
  }
}
