
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { POSLocationsHeader } from "@/components/pos-locations/POSLocationsHeader";
import { POSLocationForm } from "@/components/pos-locations/POSLocationForm";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { usePOSLocation } from "@/hooks/use-pos-location";

const POSLocations = () => {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
  } = usePOSLocation();

  const handleEditClick = (location: typeof locations[0]) => {
    setSelectedLocation(location);
    setIsAddDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedLocation(null);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setSelectedLocation(null);
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <POSLocationsHeader onAddClick={handleAddClick} />

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger className="hidden" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedLocation ? "Modifier le dépôt PDV" : "Nouveau dépôt PDV"}
              </DialogTitle>
            </DialogHeader>
            <POSLocationForm
              selectedLocation={selectedLocation}
              onSubmit={handleSubmit}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>

        <Card className="p-6">
          <POSLocationsTable
            locations={locations || []}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default POSLocations;
