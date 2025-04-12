
import { Card } from "@/components/ui/card";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocationForm } from "@/components/pos-locations/POSLocationForm";
import { POSLocationsHeader } from "@/components/pos-locations/POSLocationsHeader";
import { usePOSLocation } from "@/hooks/use-pos-location";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POSLocation } from "@/types/pos-locations";
import { FormEvent } from "react";

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

  // Helper function to convert id to location for the onEdit handler
  const onEditLocation = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    if (location) {
      setSelectedLocation(location);
      setIsAddDialogOpen(true);
    }
  };

  // Helper function to adapt the form event to POSLocation for handleSubmit
  const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Construct location object from form data
    const locationData: Partial<POSLocation> = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      manager: formData.get('manager') as string,
      status: formData.get('status') as string,
      capacity: parseInt(formData.get('capacity') as string) || 0,
      occupied: parseInt(formData.get('occupied') as string) || 0,
      surface: parseInt(formData.get('surface') as string) || 0,
      is_active: formData.get('is_active') === 'true'
    };
    
    if (selectedLocation?.id) {
      locationData.id = selectedLocation.id;
    }
    
    handleSubmit(locationData as POSLocation);
  };

  return (
    <div className="p-4 space-y-4">
      <POSLocationsHeader onAddNew={() => {
        setSelectedLocation(null);
        setIsAddDialogOpen(true);
      }} />
      
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <POSLocationsTable
          locations={locations}
          onEdit={onEditLocation}
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
            onSubmit={onSubmitForm}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
