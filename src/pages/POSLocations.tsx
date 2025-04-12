
import { Card } from "@/components/ui/card";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocationForm } from "@/components/pos-locations/POSLocationForm";
import { POSLocationsHeader } from "@/components/pos-locations/POSLocationsHeader";
import { usePOSLocation } from "@/hooks/use-pos-location";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function POSLocations() {
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete
  } = usePOSLocation();

  return (
    <div className="p-4 space-y-4">
      <POSLocationsHeader onAddNew={() => {
        setSelectedLocation(null);
        setIsAddDialogOpen(true);
      }} />
      
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <POSLocationsTable
          locations={locations || []}
          onEdit={(location) => {
            setSelectedLocation(location);
            setIsAddDialogOpen(true);
          }}
          onDelete={handleDelete}
        />
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedLocation ? "Modifier le dépôt PDV" : "Ajouter un nouveau dépôt PDV"}
            </DialogTitle>
          </DialogHeader>
          <POSLocationForm
            location={selectedLocation}
            onSubmit={handleSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
