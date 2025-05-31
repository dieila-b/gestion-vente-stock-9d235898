
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";

export const updateStockLevels = async (
  cart: CartItem[], 
  stockItems: any[], 
  selectedPDV: string
) => {
  console.log("updateStockLevels: Début de la mise à jour des niveaux de stock", {
    cartItems: cart.length,
    stockItems: stockItems.length,
    selectedPDV
  });
  
  const updatePromises = [];
  const errors = [];
  
  for (const item of cart) {
    try {
      console.log(`Traitement de l'article ${item.name} (ID: ${item.id}), quantité: ${item.quantity}`);
      
      // Si nous n'avons pas un PDV spécifique, nous ne pouvons pas mettre à jour le stock correctement
      if (!selectedPDV || selectedPDV === "_all") {
        console.error("PDV non spécifié, impossible de mettre à jour le stock");
        errors.push(`PDV non spécifié pour l'article ${item.id}`);
        continue;
      }
      
      // Trouver l'article dans le stock
      const stockItem = stockItems.find(stock => 
        stock.product_id === item.id && stock.pos_location_id === selectedPDV
      );
      
      if (!stockItem) {
        console.error(`Stock non trouvé pour le produit ${item.id} au PDV ${selectedPDV}`);
        errors.push(`Stock non trouvé pour le produit ${item.name} (ID: ${item.id}) au PDV ${selectedPDV}`);
        continue;
      }
      
      console.log(`Stock trouvé pour ${item.name}: ID=${stockItem.id}, Quantité actuelle=${stockItem.quantity}`);
      
      // Calculer la nouvelle quantité (ne peut pas être négative)
      const newQuantity = Math.max(0, stockItem.quantity - item.quantity);
      console.log(`Nouvelle quantité calculée: ${newQuantity}`);
      
      // Mettre à jour le stock
      const updatePromise = supabase
        .from('warehouse_stock')
        .update({
          quantity: newQuantity,
          total_value: newQuantity * stockItem.unit_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockItem.id)
        .then(({error}) => {
          if (error) {
            console.error(`Erreur lors de la mise à jour du stock pour ${item.name}:`, error);
            errors.push(`Erreur lors de la mise à jour du stock pour ${item.name}: ${error.message}`);
            return { success: false, error };
          }
          console.log(`Stock mis à jour avec succès pour ${item.name} (ID: ${item.id})`);
          return { success: true };
        });
      
      updatePromises.push(updatePromise);
      
      // Également mettre à jour le stock global dans le catalogue
      const updateCatalogPromise = supabase
        .from('catalog')
        .select('stock')
        .eq('id', item.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error(`Erreur lors de la récupération du stock du catalogue pour ${item.name}:`, error);
            errors.push(`Erreur lors de la récupération du stock du catalogue pour ${item.name}: ${error.message}`);
            return { success: false, error };
          }
          
          // Si nous avons des données, mettre à jour le stock
          if (data) {
            const currentStock = data.stock || 0;
            const newCatalogStock = Math.max(0, currentStock - item.quantity);
            console.log(`Mise à jour du stock catalogue pour ${item.name}: ${currentStock} -> ${newCatalogStock}`);
            
            return supabase
              .from('catalog')
              .update({
                stock: newCatalogStock,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.error(`Erreur lors de la mise à jour du stock catalogue pour ${item.name}:`, updateError);
                  errors.push(`Erreur lors de la mise à jour du stock catalogue pour ${item.name}: ${updateError.message}`);
                  return { success: false, error: updateError };
                }
                console.log(`Stock catalogue mis à jour avec succès pour ${item.name}`);
                return { success: true };
              });
          }
          
          return { success: false, error: new Error("Données du produit non trouvées") };
        });
      
      updatePromises.push(updateCatalogPromise);
      
    } catch (err) {
      console.error(`Erreur non gérée lors de la mise à jour du stock pour l'article ${item.id}:`, err);
      errors.push(`Erreur non gérée pour l'article ${item.name} (${item.id}): ${err.message || err}`);
    }
  }
  
  // Attendre que toutes les mises à jour soient terminées
  await Promise.all(updatePromises);
  
  // Afficher un résumé des erreurs s'il y en a
  if (errors.length > 0) {
    console.error(`${errors.length} erreurs lors de la mise à jour du stock:`, errors);
    throw new Error(`Erreurs lors de la mise à jour du stock: ${errors.join("; ")}`);
  }
  
  console.log("updateStockLevels: Mise à jour des niveaux de stock terminée avec succès");
};
