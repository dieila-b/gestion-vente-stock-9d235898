
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useWarehouseStock(locationId?: string, isPOS: boolean = true) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['warehouse-stock', locationId, isPOS],
    queryFn: async () => {
      try {
        console.log("Starting warehouse stock fetch:", { locationId, isPOS });

        let query = supabase
          .from('warehouse_stock')
          .select(`
            id,
            quantity,
            unit_price,
            total_value,
            pos_location_id,
            warehouse_id,
            product:product_id(
              id,
              name,
              price,
              category,
              reference
            ),
            warehouse:warehouse_id(id, name),
            pos_location:pos_location_id(id, name)
          `);

        // Construction de la requête en fonction du type (PDV ou entrepôt)
        if (isPOS) {
          console.log("Mode PDV :", locationId || "tous les PDV");
          if (locationId && locationId !== "_all") {
            query = query.eq('pos_location_id', locationId);
          } else {
            query = query.not('pos_location_id', 'is', null);
          }
        } else {
          console.log("Mode entrepôt :", locationId || "tous les entrepôts");
          if (locationId && locationId !== "_all") {
            query = query.eq('warehouse_id', locationId);
          } else {
            // Modification ici - Pour obtenir tous les enregistrements d'entrepôt, même si locationId est "_all"
            query = query.not('warehouse_id', 'is', null);
          }
        }

        console.log("Executing warehouse stock query...");
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Debug - vérifions les données retournées
        console.log(`Found ${data?.length || 0} warehouse stock records`);
        if (data && data.length > 0) {
          console.log("Sample stock record:", data[0]);
        } else {
          console.log("No stock records found. Let's try inserting test data for demonstration");
          
          // On va ajouter quelques entrées de test si aucun enregistrement n'existe
          const testProduct = await ensureTestProduct();
          const testWarehouse = await ensureTestWarehouse();
          
          if (testProduct && testWarehouse) {
            await createTestStockEntry(testProduct.id, testWarehouse.id);
            
            // Réexécuter la requête pour obtenir les données fraîchement créées
            const { data: refreshedData } = await query;
            console.log("After creating test data:", refreshedData);
            return refreshedData || [];
          }
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching warehouse stock:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de stock",
          variant: "destructive",
        });
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
    refetchInterval: 1000 * 60 * 2 // 2 minutes
  });
}

// Fonction pour vérifier si un produit de test existe, sinon le créer
async function ensureTestProduct() {
  const { data: existingProducts } = await supabase
    .from('catalog')
    .select('id, name, price')
    .limit(1);

  if (existingProducts && existingProducts.length > 0) {
    console.log("Using existing product:", existingProducts[0]);
    return existingProducts[0];
  }

  // Créer un produit de test si aucun n'existe
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

// Fonction pour vérifier si un entrepôt de test existe, sinon le créer
async function ensureTestWarehouse() {
  const { data: existingWarehouses } = await supabase
    .from('warehouses')
    .select('id, name')
    .limit(1);

  if (existingWarehouses && existingWarehouses.length > 0) {
    console.log("Using existing warehouse:", existingWarehouses[0]);
    return existingWarehouses[0];
  }

  // Créer un entrepôt de test si aucun n'existe
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

// Fonction pour créer une entrée de stock de test
async function createTestStockEntry(productId: string, warehouseId: string) {
  // D'abord, vérifier si l'entrée existe déjà
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

  // Créer l'entrée de stock
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
  
  // Créer également un mouvement de stock correspondant
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
