
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Warehouse, Store } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseStats } from "@/components/warehouses/WarehouseStats";
import { POSLocationStats } from "@/components/warehouses/POSLocationStats";
import { WarehousesHeader } from "@/components/warehouses/WarehousesHeader";
import { WarehouseList } from "@/components/stocks/warehouses/WarehouseList";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { useWarehouse } from "@/hooks/use-warehouse";
import { usePOSLocation } from "@/hooks/use-pos-location";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { POSLocationForm } from "@/components/pos-locations/POSLocationForm";

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("warehouses");

  // Warehouse management
  const {
    warehouses,
    selectedWarehouse,
    setSelectedWarehouse,
    isAddDialogOpen: isWarehouseDialogOpen,
    setIsAddDialogOpen: setIsWarehouseDialogOpen,
    handleSubmit: handleWarehouseSubmit,
    handleDelete: handleWarehouseDelete
  } = useWarehouse();

  // POS locations management
  const {
    locations: posLocations,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen: isPOSDialogOpen,
    setIsAddDialogOpen: setIsPOSDialogOpen,
    handleSubmit: handlePOSSubmit,
    handleDelete: handlePOSDelete,
    refetch: refetchPOSLocations
  } = usePOSLocation();

  // Force a refetch when tab changes to POS
  useEffect(() => {
    if (activeTab === "pos" && refetchPOSLocations) {
      refetchPOSLocations();
    }
  }, [activeTab, refetchPOSLocations]);

  // Filter warehouses based on search query
  const filteredWarehouses = warehouses?.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter POS locations based on search query
  const filteredPOSLocations = posLocations?.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.manager && location.manager.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Calculate warehouse stats
  const totalWarehouses = warehouses?.length || 0;
  const totalSurface = warehouses?.reduce((sum, w) => sum + w.surface, 0) || 0;
  const averageOccupancyRate = warehouses?.length ? 
    warehouses.reduce((sum, w) => sum + ((w.occupied / w.capacity) * 100), 0) / warehouses.length : 0;

  // Calculate POS locations stats
  const totalPOSLocations = posLocations?.length || 0;
  const totalPOSSurface = posLocations?.reduce((sum, location) => sum + (location.surface || 0), 0) || 0;
  
  // Only include locations with valid capacity in the calculation
  const locationsWithCapacity = posLocations?.filter(loc => loc.capacity > 0) || [];
  const averagePOSOccupancyRate = locationsWithCapacity.length > 0 
    ? locationsWithCapacity.reduce((sum, location) => 
        sum + ((location.occupied / location.capacity) * 100), 0) / locationsWithCapacity.length
    : 0;

  // Handle add new button click based on active tab
  const handleAddNewClick = () => {
    if (activeTab === "warehouses") {
      setSelectedWarehouse(null);
      setIsWarehouseDialogOpen(true);
    } else {
      setSelectedLocation(null);
      setIsPOSDialogOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <WarehousesHeader 
          activeTab={activeTab}
          onAddNew={handleAddNewClick}
        />

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
            <WarehouseList 
              warehouses={filteredWarehouses}
              onAddNew={() => {
                setSelectedWarehouse(null);
                setIsWarehouseDialogOpen(true);
              }}
              onEdit={(warehouse) => {
                setSelectedWarehouse(warehouse);
                setIsWarehouseDialogOpen(true);
              }}
              onDelete={handleWarehouseDelete}
              isAddDialogOpen={isWarehouseDialogOpen}
              setIsAddDialogOpen={setIsWarehouseDialogOpen}
              selectedWarehouse={selectedWarehouse}
              handleSubmit={handleWarehouseSubmit}
            />
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
              onEdit={(location) => {
                setSelectedLocation(location);
                setIsPOSDialogOpen(true);
              }}
              onDelete={handlePOSDelete}
            />
          </TabsContent>
        </Tabs>

        {/* Dialog for POS location form */}
        <Dialog open={isPOSDialogOpen} onOpenChange={setIsPOSDialogOpen}>
          <DialogContent className="sm:max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedLocation ? "Modifier le point de vente" : "Ajouter un nouveau point de vente"}
              </DialogTitle>
            </DialogHeader>
            <POSLocationForm
              location={selectedLocation}
              onSubmit={handlePOSSubmit}
              onCancel={() => setIsPOSDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
