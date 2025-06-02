
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useProducts } from "@/hooks/use-products";

export const CatalogDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<{
    catalogCount: number;
    sampleProducts: any[];
    error?: string;
    rawData?: any[];
  }>({
    catalogCount: 0,
    sampleProducts: [],
    rawData: []
  });

  const { products, isLoading, error } = useProducts();

  useEffect(() => {
    const checkCatalog = async () => {
      try {
        console.log("=== DEBUG CATALOGUE ===");
        
        // Test de connexion basique et comptage
        const { count, error: countError } = await supabase
          .from('catalog')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error("Erreur de comptage:", countError);
          setDebugInfo(prev => ({ ...prev, error: countError.message }));
          return;
        }

        console.log("Nombre total d'articles dans catalog:", count);

        // Récupération des données complètes
        const { data: fullData, error: fullError } = await supabase
          .from('catalog')
          .select('*')
          .limit(5);

        if (fullError) {
          console.error("Erreur de récupération:", fullError);
          setDebugInfo(prev => ({ ...prev, error: fullError.message }));
          return;
        }

        console.log("Données complètes du catalogue:", fullData);
        
        // Vérifier la structure des champs
        if (fullData && fullData.length > 0) {
          console.log("Structure du premier produit:", Object.keys(fullData[0]));
          console.log("Valeurs du premier produit:", fullData[0]);
        }

        setDebugInfo({
          catalogCount: count || 0,
          sampleProducts: fullData?.slice(0, 3) || [],
          rawData: fullData || [],
          error: undefined
        });
      } catch (error: any) {
        console.error("Échec du debug:", error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      }
    };

    checkCatalog();
  }, []);

  // Toujours afficher en développement pour le debug
  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <h4 className="font-medium mb-2">🔍 Debug - État du catalogue</h4>
      <div className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Base de données:</strong></p>
            <p>• Nombre total: <span className="font-mono">{debugInfo.catalogCount}</span></p>
            {debugInfo.error && (
              <p className="text-red-600">• Erreur DB: {debugInfo.error}</p>
            )}
          </div>
          
          <div>
            <p><strong>Hook useProducts:</strong></p>
            <p>• Produits chargés: <span className="font-mono">{products?.length || 0}</span></p>
            <p>• État: <span className="font-mono">{isLoading ? 'Chargement...' : 'Terminé'}</span></p>
            {error && (
              <p className="text-red-600">• Erreur Hook: {error.message}</p>
            )}
          </div>
        </div>

        {debugInfo.sampleProducts.length > 0 && (
          <div>
            <p><strong>Exemples de produits (DB):</strong></p>
            <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              {debugInfo.sampleProducts.map((product, index) => (
                <div key={index} className="mb-1">
                  <span className="font-semibold">{product.name || '[SANS_NOM]'}</span>
                  {' '}(ID: {product.id?.slice(0, 8)}...)
                  {product.reference && ` - Ref: ${product.reference}`}
                  {' '}• Prix: {product.price || 0} / Achat: {product.purchase_price || 0}
                </div>
              ))}
            </div>
          </div>
        )}

        {products && products.length > 0 && (
          <div>
            <p><strong>Produits traités par le hook:</strong></p>
            <div className="bg-green-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              {products.slice(0, 3).map((product, index) => (
                <div key={index} className="mb-1">
                  <span className="font-semibold">{product.name}</span>
                  {' '}(ID: {product.id?.slice(0, 8)}...)
                  {product.reference && ` - Ref: ${product.reference}`}
                  {' '}• Prix: {product.price} / Achat: {product.purchase_price}
                </div>
              ))}
            </div>
          </div>
        )}

        {debugInfo.catalogCount === 0 && (
          <div className="bg-yellow-100 p-2 rounded">
            <p className="text-orange-600">⚠️ Aucun produit trouvé dans la table 'catalog'</p>
          </div>
        )}

        {debugInfo.catalogCount > 0 && products?.length === 0 && !isLoading && (
          <div className="bg-red-100 p-2 rounded">
            <p className="text-red-600">❌ Produits en DB mais hook vide - Problème de transformation</p>
          </div>
        )}
      </div>
    </Card>
  );
};
