
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import { useToast } from "@/hooks/use-toast";
import { MainStockHeader } from "@/components/stocks/main-stock/MainStockHeader";
import { WarehouseList } from "@/components/stocks/warehouses/WarehouseList";
import { StockItemsList } from "@/components/stocks/main-stock/StockItemsList";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  surface: number;
  capacity: number;
  manager: string;
  status: string;
  occupied: number;
}

export default function MainStock() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stockItems = [], isLoading } = useWarehouseStock("_all", false);

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location, surface, capacity, manager, status, occupied')
        .order('name');
      
      if (error) throw error;
      return data as Warehouse[];
    }
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <MainStockHeader />
      <WarehouseList warehouses={warehouses} />
      <StockItemsList 
        items={stockItems} 
        warehouses={warehouses} 
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
}
