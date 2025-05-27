
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "../useStockMovementTypes";

export async function createStockEntryInDb(data: StockEntryForm): Promise<boolean> {
  try {
    console.log("=== DÉBUT CRÉATION ENTRÉE STOCK ===");
    console.log("Données reçues:", data);
    
    if (!data.warehouseId || !data.productId) {
      throw new Error("L'emplacement et le produit sont obligatoires");
    }
    
    if (data.quantity <= 0) {
      throw new Error("La quantité doit être positive");
    }
    
    const totalValue = data.quantity * data.unitPrice;
    
    console.log(`Création d'une entrée stock pour le produit ${data.productId} dans l'emplacement ${data.warehouseId} - Quantité: ${data.quantity}, Prix unitaire: ${data.unitPrice}, Valeur totale: ${totalValue}`);
    
    // 1. Détecter le type d'emplacement (entrepôt ou PDV)
    console.log("Étape 1: Détection du type d'emplacement...");
    const locationInfo = await getLocationInfo(data.warehouseId);
    console.log("Informations sur l'emplacement:", locationInfo);
    
    // 2. Insert the stock movement avec le bon champ selon le type d'emplacement
    console.log("Étape 2: Création du mouvement de stock...");
    const movementData: any = {
      product_id: data.productId,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      total_value: totalValue,
      type: 'in',
      reason: data.reason
    };

    // Assigner le bon champ selon le type d'emplacement
    if (locationInfo.isWarehouse) {
      movementData.warehouse_id = data.warehouseId;
    } else {
      // Pour les PDV, on ne peut pas utiliser warehouse_id car la contrainte FK n'accepte que les entrepôts
      // On stocke l'ID du PDV dans le reason ou on crée une logique différente
      console.warn("Tentative d'insertion d'un mouvement pour un PDV - utilisation d'un entrepôt par défaut");
      // Utiliser un entrepôt par défaut ou gérer différemment
      const { data: defaultWarehouse } = await supabase
        .from('warehouses')
        .select('id')
        .limit(1)
        .single();
      
      if (defaultWarehouse) {
        movementData.warehouse_id = defaultWarehouse.id;
        movementData.reason = `${data.reason} (PDV: ${locationInfo.name})`;
      } else {
        throw new Error("Aucun entrepôt disponible pour enregistrer le mouvement de PDV");
      }
    }

    const { data: movementResult, error: movementError } = await supabase
      .from('warehouse_stock_movements')
      .insert(movementData)
      .select();

    if (movementError) {
      console.error("Erreur lors de la création du mouvement:", movementError);
      throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
    }
    
    console.log("Mouvement de stock créé avec succès:", movementResult);
    
    // 3. Mettre à jour la table warehouse_stock
    console.log("Étape 3: Mise à jour warehouse_stock...");
    await updateWarehouseStock(data, totalValue, locationInfo);

    // 4. Mettre à jour le stock du catalogue
    console.log("Étape 4: Mise à jour du catalogue...");
    await updateCatalogStock(data);
    
    // 5. Mettre à jour stock_principal
    console.log("Étape 5: Mise à jour stock_principal...");
    await updateStockPrincipal(data, totalValue, locationInfo);

    console.log("=== ENTRÉE STOCK CRÉÉE AVEC SUCCÈS ===");
    return true;
  } catch (error: any) {
    console.error("=== ERREUR DANS createStockEntryInDb ===");
    console.error("Erreur détaillée:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

async function getLocationInfo(locationId: string): Promise<{ isWarehouse: boolean; isPOS: boolean; name: string; }> {
  try {
    console.log(`Recherche des informations pour l'emplacement: ${locationId}`);
    
    // Vérifier d'abord dans warehouses
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('id', locationId)
      .maybeSingle();
    
    if (warehouseError) {
      console.error("Erreur lors de la recherche dans warehouses:", warehouseError);
    }
    
    if (warehouseData) {
      console.log("Entrepôt trouvé:", warehouseData);
      return { isWarehouse: true, isPOS: false, name: warehouseData.name };
    }
    
    // Vérifier ensuite dans pos_locations
    const { data: posData, error: posError } = await supabase
      .from('pos_locations')
      .select('id, name')
      .eq('id', locationId)
      .maybeSingle();
    
    if (posError) {
      console.error("Erreur lors de la recherche dans pos_locations:", posError);
    }
    
    if (posData) {
      console.log("Point de vente trouvé:", posData);
      return { isWarehouse: false, isPOS: true, name: posData.name };
    }
    
    console.warn(`Emplacement ${locationId} non trouvé dans warehouses ou pos_locations`);
    return { isWarehouse: true, isPOS: false, name: 'Emplacement inconnu' };
  } catch (error) {
    console.error("Erreur lors de la récupération des informations sur l'emplacement:", error);
    return { isWarehouse: true, isPOS: false, name: 'Emplacement inconnu' };
  }
}

async function updateWarehouseStock(data: StockEntryForm, totalValue: number, locationInfo: { isWarehouse: boolean; isPOS: boolean; name: string; }): Promise<void> {
  try {
    console.log("Mise à jour warehouse_stock avec:", { data, totalValue, locationInfo });
    
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
      console.error("Erreur lors de la vérification du stock existant:", stockCheckError);
      throw new Error(`Erreur lors de la vérification du stock: ${stockCheckError.message}`);
    }
    
    if (existingStock) {
      // Mise à jour avec calcul de prix moyen pondéré
      const newQuantity = existingStock.quantity + data.quantity;
      const oldValue = existingStock.quantity * existingStock.unit_price;
      const newValue = data.quantity * data.unitPrice;
      const newTotalValue = oldValue + newValue;
      const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : data.unitPrice;
      
      console.log("Mise à jour du stock existant:", {
        id: existingStock.id,
        ancienneQuantite: existingStock.quantity,
        nouvelleQuantite: newQuantity,
        ancienPrixUnitaire: existingStock.unit_price,
        nouveauPrixUnitaire: newUnitPrice,
        nouvelleValeurTotale: newTotalValue
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
        console.error("Erreur lors de la mise à jour du stock d'entrepôt:", updateError);
        throw new Error(`Erreur lors de la mise à jour du stock: ${updateError.message}`);
      }
      
      console.log("Stock d'entrepôt mis à jour avec succès:", updateResult);
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
      
      console.log("Création d'une nouvelle entrée de stock d'entrepôt:", stockData);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('warehouse_stock')
        .insert(stockData)
        .select();
        
      if (insertError) {
        console.error("Erreur lors de la création du stock d'entrepôt:", insertError);
        throw new Error(`Erreur lors de la création du stock: ${insertError.message}`);
      }
      
      console.log("Nouvelle entrée de stock d'entrepôt créée avec succès:", insertResult);
    }
  } catch (error) {
    console.error("Erreur dans updateWarehouseStock:", error);
    throw error;
  }
}

async function updateCatalogStock(data: StockEntryForm): Promise<void> {
  try {
    console.log("Mise à jour du stock du catalogue pour le produit:", data.productId);
    
    // Récupérer le stock actuel du catalogue
    const { data: productData, error: productError } = await supabase
      .from('catalog')
      .select('stock')
      .eq('id', data.productId)
      .single();

    if (productError) {
      console.error("Erreur lors de la récupération du stock actuel du produit:", productError);
      throw new Error(`Erreur lors de la récupération du produit: ${productError.message}`);
    }

    // Calculer le nouveau stock
    const currentStock = productData?.stock || 0;
    const newStock = currentStock + data.quantity;
    console.log(`Mise à jour du stock du produit ${data.productId} de ${currentStock} à ${newStock}`);

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
      console.error("Erreur lors de la mise à jour du stock du produit dans le catalogue:", updateError);
      throw new Error(`Erreur lors de la mise à jour du stock du produit: ${updateError.message}`);
    }
        
    console.log(`Stock du catalogue mis à jour de ${currentStock} à ${newStock}:`, updateResult);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du stock du catalogue:", err);
    throw err;
  }
}

async function updateStockPrincipal(data: StockEntryForm, totalValue: number, locationInfo: { isWarehouse: boolean; isPOS: boolean; name: string; }): Promise<void> {
  try {
    console.log("Mise à jour de stock_principal pour:", data.productId);
    
    // Récupérer le nom du produit
    const { data: productData, error: productError } = await supabase
      .from('catalog')
      .select('name')
      .eq('id', data.productId)
      .single();
      
    if (productError) {
      console.error("Erreur lors de la récupération du nom du produit pour stock_principal:", productError);
      throw new Error(`Erreur lors de la récupération du produit: ${productError.message}`);
    }
    
    const productName = productData.name;
    const locationName = locationInfo.name;
    
    console.log("Mise à jour de stock_principal pour:", { productName, locationName, quantity: data.quantity });
    
    // Vérifier si une entrée existe déjà dans stock_principal
    const { data: existingEntry, error: checkError } = await supabase
      .from('stock_principal')
      .select('id, quantite, prix_unitaire, valeur_totale')
      .eq('article', productName)
      .eq('entrepot', locationName)
      .maybeSingle();
      
    if (checkError) {
      console.error("Erreur lors de la vérification de l'entrée stock_principal existante:", checkError);
      throw new Error(`Erreur lors de la vérification du stock principal: ${checkError.message}`);
    }
    
    if (existingEntry) {
      // Mettre à jour l'entrée existante avec calcul de moyenne pondérée
      const newQuantity = existingEntry.quantite + data.quantity;
      const oldValue = existingEntry.quantite * existingEntry.prix_unitaire;
      const newValue = data.quantity * data.unitPrice;
      const newTotalValue = oldValue + newValue;
      const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : data.unitPrice;
      
      console.log("Mise à jour de l'entrée stock_principal existante:", {
        id: existingEntry.id,
        article: productName,
        entrepot: locationName,
        ancienneQuantite: existingEntry.quantite,
        nouvelleQuantite: newQuantity,
        ancienPrixUnitaire: existingEntry.prix_unitaire,
        nouveauPrixUnitaire: newUnitPrice,
        nouvelleValeurTotale: newTotalValue
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
        console.error("Erreur lors de la mise à jour de stock_principal:", updateError);
        throw new Error(`Erreur lors de la mise à jour du stock principal: ${updateError.message}`);
      }
      
      console.log("stock_principal mis à jour avec succès:", updateResult);
    } else {
      // Créer une nouvelle entrée
      console.log("Création d'une nouvelle entrée stock_principal:", {
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
        console.error("Erreur lors de la création de l'entrée stock_principal:", insertError);
        throw new Error(`Erreur lors de la création de l'entrée dans le stock principal: ${insertError.message}`);
      }
      
      console.log("Nouvelle entrée stock_principal créée avec succès:", insertResult);
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour de stock_principal:", err);
    throw err;
  }
}
