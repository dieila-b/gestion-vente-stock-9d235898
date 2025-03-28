
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Warehouse, Store } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseStats } from "@/components/warehouses/WarehouseStats";
import { POSLocationStats } from "@/components/warehouses/POSLocationStats";
import { WarehousesHeader } from "@/components/warehouses/WarehousesHeader";
import { WarehouseList } from "@/components/stocks/warehouses/WarehouseList";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocation } from "@/types/pos-locations";

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

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("warehouses");

  // Fetch warehouses data
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

  // Fetch POS locations data
  const { data: posLocations = [] } = useQuery<POSLocation[]>({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as POSLocation[];
    }
  });

  // Filter warehouses based on search query
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter POS locations based on search query
  const filteredPOSLocations = posLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.manager && location.manager.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate warehouse stats
  const totalWarehouses = warehouses.length;
  const totalSurface = warehouses.reduce((sum, w) => sum + w.surface, 0);
  const averageOccupancyRate = warehouses.length > 0 
    ? warehouses.reduce((sum, w) => sum + ((w.occupied / w.capacity) * 100), 0) / warehouses.length
    : 0;

  // Calculate POS locations stats
  const totalPOSLocations = posLocations.length;
  const totalPOSSurface = posLocations.reduce((sum, location) => sum + (location.surface || 0), 0);
  const averagePOSOccupancyRate = posLocations.length > 0 
    ? posLocations.reduce((sum, location) => 
        sum + ((location.occupied / location.capacity) * 100), 0) / posLocations.length
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <WarehousesHeader />

        <Tabs defaultValue="warehouses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Entrepôts
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Points de Vente
            </TabsTrigger>
          </TabsList>

          {/* Warehouses Tab Content */}
          <TabsContent value="warehouses" className="space-y-6">
            <WarehouseStats 
              totalWarehouses={totalWarehouses}
              totalSurface={totalSurface}
              averageOccupancyRate={averageOccupancyRate}
            />
            <WarehouseList warehouses={filteredWarehouses} />
          </TabsContent>

          {/* POS Locations Tab Content */}
          <TabsContent value="pos" className="space-y-6">
            <POSLocationStats 
              totalPOSLocations={totalPOSLocations}
              totalPOSSurface={totalPOSSurface}
              averagePOSOccupancyRate={averagePOSOccupancyRate}
            />
            <POSLocationsTable 
              posLocations={filteredPOSLocations} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
