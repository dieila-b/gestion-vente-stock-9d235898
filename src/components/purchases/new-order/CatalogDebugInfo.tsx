
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const CatalogDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<{
    catalogCount: number;
    sampleProducts: any[];
    error?: string;
  }>({
    catalogCount: 0,
    sampleProducts: []
  });

  useEffect(() => {
    const checkCatalog = async () => {
      try {
        console.log("Checking catalog table...");
        
        // Test de connexion basique
        const { count, error: countError } = await supabase
          .from('catalog')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error("Count error:", countError);
          setDebugInfo(prev => ({ ...prev, error: countError.message }));
          return;
        }

        // Récupération d'un échantillon
        const { data: sampleData, error: sampleError } = await supabase
          .from('catalog')
          .select('id, name, reference, price, purchase_price, stock')
          .limit(3);

        if (sampleError) {
          console.error("Sample error:", sampleError);
          setDebugInfo(prev => ({ ...prev, error: sampleError.message }));
          return;
        }

        console.log("Catalog debug info:", { count, sampleData });
        
        setDebugInfo({
          catalogCount: count || 0,
          sampleProducts: sampleData || [],
          error: undefined
        });
      } catch (error: any) {
        console.error("Debug check failed:", error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      }
    };

    checkCatalog();
  }, []);

  // Ce composant ne s'affiche qu'en développement
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <h4 className="font-medium mb-2">Debug - État du catalogue</h4>
      <div className="text-sm space-y-1">
        <p>Nombre de produits: <strong>{debugInfo.catalogCount}</strong></p>
        {debugInfo.error && (
          <p className="text-red-600">Erreur: {debugInfo.error}</p>
        )}
        {debugInfo.sampleProducts.length > 0 && (
          <div>
            <p>Exemples de produits:</p>
            <ul className="list-disc list-inside ml-2">
              {debugInfo.sampleProducts.map((product) => (
                <li key={product.id}>
                  {product.name} (Ref: {product.reference || 'N/A'})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
