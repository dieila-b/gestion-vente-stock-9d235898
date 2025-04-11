
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import { createTableQuery } from "@/hooks/use-supabase-table-extension";
import { StockItemsTable } from "@/components/stocks/stock-table/StockItemsTable";
import { POSStockHeader } from "@/components/stocks/pos-stock/POSStockHeader";
import { POSStockLocations } from "@/components/stocks/pos-stock/POSStockLocations";
import { StockItemsFilter } from "@/components/stocks/pos-stock/StockItemsFilter";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export interface POSLocation {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  manager?: string;
  status?: string;
  is_active?: boolean;
}

export default function POSStock() {
  const [selectedLocation, setSelectedLocation] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");

  // Récupérer la liste des points de vente
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await createTableQuery('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform and filter out any SelectQueryErrors
      return (data || [])
        .filter(item => !isSelectQueryError(item))
        .map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          address: item.address,
          status: item.status,
          is_active: item.is_active,
          manager: item.manager
        })) as POSLocation[];
    }
  });

  const { data: stockItems = [], isLoading } = useWarehouseStock(selectedLocation, true);

  // Filtrer les articles en fonction de la recherche
  const filteredItems = stockItems.filter(item => {
    if (isSelectQueryError(item.product)) return false;
    
    return (
      (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Handle selecting a location
  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <POSStockHeader />

        <POSStockLocations 
          onLocationChange={handleLocationChange}
          selectedLocation={selectedLocation}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gradient">Liste des Articles</h2>
          <StockItemsFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            posLocations={posLocations}
          />

          <StockItemsTable 
            items={filteredItems} 
            isLoading={isLoading} 
            emptyMessage="Aucun article trouvé dans ce PDV"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
