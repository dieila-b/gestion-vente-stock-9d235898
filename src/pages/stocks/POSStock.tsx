
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import { supabase } from "@/integrations/supabase/client";
import { StockItemsListTable } from "@/components/stocks/StockItemsListTable";
import { POSStockHeader } from "@/components/stocks/pos-stock/POSStockHeader";
import { POSStockLocations } from "@/components/stocks/pos-stock/POSStockLocations";
import { StockItemsFilter } from "@/components/stocks/pos-stock/StockItemsFilter";
import { POSLocation } from "@/types/pos-locations";

export default function POSStock() {
  const [selectedLocation, setSelectedLocation] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");
  const [posSearchQuery, setPosSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");

  // Récupérer la liste des points de vente
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stockItems = [], isLoading } = useWarehouseStock(selectedLocation, true);

  // Filtrer les articles en fonction de la recherche
  const filteredItems = stockItems.filter(item => 
    (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedWarehouse === "_all" || item.warehouse?.id === selectedWarehouse)
  );

  // Récupérer la liste des entrepôts
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Handle selecting a location
  const handleSelectLocation = (location: POSLocation) => {
    setSelectedLocation(location.id);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <POSStockHeader />

        <POSStockLocations 
          posLocations={posLocations}
          posSearchQuery={posSearchQuery}
          setPosSearchQuery={setPosSearchQuery}
          onSelectLocation={handleSelectLocation}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gradient">Liste des Articles</h2>
          <StockItemsFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            warehouses={warehouses}
          />

          <StockItemsListTable items={filteredItems} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
