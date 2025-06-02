
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSuppliers } from "@/hooks/use-suppliers";

export const SuppliersDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<{
    suppliersCount: number;
    sampleSuppliers: any[];
    error?: string;
    rawData?: any[];
  }>({
    suppliersCount: 0,
    sampleSuppliers: [],
    rawData: []
  });

  const { suppliers, isLoading, error } = useSuppliers();

  useEffect(() => {
    const checkSuppliers = async () => {
      try {
        console.log("=== DEBUG FOURNISSEURS ===");
        
        // Test de connexion et comptage
        const { count, error: countError } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error("Erreur de comptage fournisseurs:", countError);
          setDebugInfo(prev => ({ ...prev, error: countError.message }));
          return;
        }

        console.log("Nombre total de fournisseurs:", count);

        // Récupération des données complètes
        const { data: fullData, error: fullError } = await supabase
          .from('suppliers')
          .select('*')
          .limit(5);

        if (fullError) {
          console.error("Erreur de récupération fournisseurs:", fullError);
          setDebugInfo(prev => ({ ...prev, error: fullError.message }));
          return;
        }

        console.log("Données fournisseurs:", fullData);
        
        setDebugInfo({
          suppliersCount: count || 0,
          sampleSuppliers: fullData?.slice(0, 3) || [],
          rawData: fullData || [],
          error: undefined
        });
      } catch (error: any) {
        console.error("Échec du debug fournisseurs:", error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      }
    };

    checkSuppliers();
  }, []);

  return (
    <Card className="p-4 mb-4 bg-green-50 border-green-200">
      <h4 className="font-medium mb-2">🏢 Debug - État des fournisseurs</h4>
      <div className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Base de données:</strong></p>
            <p>• Nombre total: <span className="font-mono">{debugInfo.suppliersCount}</span></p>
            {debugInfo.error && (
              <p className="text-red-600">• Erreur DB: {debugInfo.error}</p>
            )}
          </div>
          
          <div>
            <p><strong>Hook useSuppliers:</strong></p>
            <p>• Fournisseurs chargés: <span className="font-mono">{suppliers?.length || 0}</span></p>
            <p>• État: <span className="font-mono">{isLoading ? 'Chargement...' : 'Terminé'}</span></p>
            {error && (
              <p className="text-red-600">• Erreur Hook: {error.message}</p>
            )}
          </div>
        </div>

        {debugInfo.sampleSuppliers.length > 0 && (
          <div>
            <p><strong>Exemples de fournisseurs (DB):</strong></p>
            <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              {debugInfo.sampleSuppliers.map((supplier, index) => (
                <div key={index} className="mb-1">
                  <span className="font-semibold">{supplier.name || '[SANS_NOM]'}</span>
                  {' '}(ID: {supplier.id?.slice(0, 8)}...)
                  {supplier.contact && ` - Contact: ${supplier.contact}`}
                  {' '}• Email: {supplier.email || 'N/A'}
                </div>
              ))}
            </div>
          </div>
        )}

        {suppliers && suppliers.length > 0 && (
          <div>
            <p><strong>Fournisseurs traités par le hook:</strong></p>
            <div className="bg-green-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              {suppliers.slice(0, 3).map((supplier, index) => (
                <div key={index} className="mb-1">
                  <span className="font-semibold">{supplier.name}</span>
                  {' '}(ID: {supplier.id?.slice(0, 8)}...)
                  {supplier.contact && ` - Contact: ${supplier.contact}`}
                  {' '}• Email: {supplier.email || 'N/A'}
                </div>
              ))}
            </div>
          </div>
        )}

        {debugInfo.suppliersCount === 0 && (
          <div className="bg-yellow-100 p-2 rounded">
            <p className="text-orange-600">⚠️ Aucun fournisseur trouvé dans la table 'suppliers'</p>
          </div>
        )}

        {debugInfo.suppliersCount > 0 && suppliers?.length === 0 && !isLoading && (
          <div className="bg-red-100 p-2 rounded">
            <p className="text-red-600">❌ Fournisseurs en DB mais hook vide - Problème de transformation</p>
          </div>
        )}
      </div>
    </Card>
  );
};
