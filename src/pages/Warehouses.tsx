import { useState, useEffect } from "react";
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
    },
    refetchInterval: 30000 // refresh every 30 seconds
  });

  // Fetch POS locations data with real-time occupation information
  const { data: posLocations = [], refetch: refetchPOSLocations } = useQuery<POSLocation[]>({
    queryKey: ['pos-locations-for-tab'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log("Fetched POS locations in Warehouses:", data);
      return data as POSLocation[];
    },
    // Force frequent refreshes to keep occupation rates up to date
    refetchInterval: 15000 // refresh every 15 seconds
  });

  // Force a refetch when tab changes to POS
  useEffect(() => {
    if (activeTab === "pos") {
      refetchPOSLocations();
    }
  }, [activeTab, refetchPOSLocations]);

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

  // Calculate POS locations stats with proper occupation calculation
  const totalPOSLocations = posLocations.length;
  const totalPOSSurface = posLocations.reduce((sum, location) => sum + (location.surface || 0), 0);
  
  // Only include locations with valid capacity in the calculation
  const locationsWithCapacity = posLocations.filter(loc => loc.capacity > 0);
  const averagePOSOccupancyRate = locationsWithCapacity.length > 0 
    ? locationsWithCapacity.reduce((sum, location) => 
        sum + ((location.occupied / location.capacity) * 100), 0) / locationsWithCapacity.length
    : 0;

  console.log("POS Locations:", posLocations);
  console.log("Locations with capacity:", locationsWithCapacity);
  console.log("Average POS Occupancy Rate:", averagePOSOccupancyRate);

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
