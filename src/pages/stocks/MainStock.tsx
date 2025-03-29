
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { MainStockHeader } from "@/components/stocks/main-stock/MainStockHeader";
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WarehouseStatsTable } from "@/components/stocks/warehouses/WarehouseStatsTable";
import { StockItemsListTable } from "@/components/stocks/StockItemsListTable";
import { Building2 } from "lucide-react";

export default function MainStock() {
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseSearchQuery, setWarehouseSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");

  // Get warehouse data
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

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(warehouseSearchQuery.toLowerCase())
  );

  // Get stock items
  const { data: stockItems = [], isLoading } = useWarehouseStock(selectedWarehouse, false);

  // Filter stock items based on search and selected warehouse
  const filteredItems = stockItems.filter(item => 
    (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedWarehouse === "_all" || item.warehouse?.id === selectedWarehouse)
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <MainStockHeader />

        <Card className="enhanced-glass p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gradient">
                Liste des Entrepôts
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Rechercher..." 
                    value={warehouseSearchQuery}
                    onChange={(e) => setWarehouseSearchQuery(e.target.value)}
                    className="pl-10 glass-effect"
                  />
                </div>
                <Button variant="outline" className="glass-effect">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>

            <WarehouseStatsTable 
              warehouses={filteredWarehouses} 
              locationIcon={<Building2 className="h-4 w-4" />}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gradient">Liste des Articles</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Rechercher un article..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect w-80"
            />
          </div>

          <StockItemsListTable items={filteredItems} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
