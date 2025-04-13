
import { Card } from "@/components/ui/card";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocationForm } from "@/components/pos-locations/POSLocationForm";
import { POSLocationsHeader } from "@/components/pos-locations/POSLocationsHeader";
import { usePOSLocation } from "@/hooks/use-pos-location";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POSLocation } from "@/types/pos-locations";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Building2, AreaChart, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

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
  
  const [searchTerm, setSearchTerm] = useState("");

  // Adapter function to handle the location parameter
  const onEditLocation = (location: POSLocation) => {
    setSelectedLocation(location);
    setIsAddDialogOpen(true);
  };

  // Adapter function to handle string id parameter
  const onDeleteLocation = (location: POSLocation) => {
    handleDelete(location.id);
  };

  // Helper function to adapt the form event to POSLocation for handleSubmit
  const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Construire l'objet location à partir des données du formulaire
    const locationData: Partial<POSLocation> = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      manager: formData.get('manager') as string,
      status: formData.get('status') as string,
      is_active: formData.get('is_active') === 'true',
      capacity: parseInt(formData.get('capacity') as string) || 0,
      occupied: parseInt(formData.get('occupied') as string) || 0,
      surface: parseInt(formData.get('surface') as string) || 0
    };
    
    if (selectedLocation?.id) {
      locationData.id = selectedLocation.id;
    }
    
    handleSubmit(locationData as POSLocation);
  };

  // Calculer les statistiques totales
  const totalLocations = locations?.length || 0;
  const totalSurface = locations?.reduce((total, loc) => total + (loc.surface || 0), 0) || 0;
  
  // Calculer le taux d'occupation moyen
  let occupationRate = 0;
  if (totalLocations > 0) {
    const totalCapacity = locations?.reduce((total, loc) => total + (loc.capacity || 0), 0) || 0;
    const totalOccupied = locations?.reduce((total, loc) => total + (loc.occupied || 0), 0) || 0;
    occupationRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  }

  // Filtrer les emplacements en fonction du terme de recherche
  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <PageHeader>
        <PageHeader.Title>Points de Vente</PageHeader.Title>
        <PageHeader.Description>Gérez les emplacements de vos points de vente</PageHeader.Description>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Carte Total Entrepôts */}
        <Card className="glass-panel p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entrepôts</p>
              <h3 className="text-3xl font-bold mt-1">{totalLocations}</h3>
              <p className="text-xs text-green-500 mt-1">↑ 2.0%</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        {/* Carte Surface Totale */}
        <Card className="glass-panel p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Surface Totale</p>
              <h3 className="text-3xl font-bold mt-1">{totalSurface} m<sup>2</sup></h3>
              <p className="text-xs text-green-500 mt-1">↑ 15.0%</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">
              <AreaChart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        {/* Carte Taux Occupation Moyen */}
        <Card className="glass-panel p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taux Occupation Moyen</p>
              <h3 className="text-3xl font-bold mt-1">{occupationRate} %</h3>
              <p className="text-xs text-green-500 mt-1">↑ 5.0%</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="glass-panel p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Liste des Points de Vente</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un point de vente..."
                className="pl-9 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-1"
              onClick={() => {
                setSelectedLocation(null);
                setIsAddDialogOpen(true);
              }}
            >
              <span className="text-lg font-bold">+</span>
              <span>Nouveau point de vente</span>
            </button>
          </div>
        </div>
        
        <POSLocationsTable
          locations={filteredLocations as POSLocation[]}
          onEdit={onEditLocation}
          onDelete={onDeleteLocation}
        />
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedLocation ? "Modifier le point de vente" : "Ajouter un nouveau point de vente"}
            </DialogTitle>
          </DialogHeader>
          <POSLocationForm
            location={selectedLocation as POSLocation}
            onSubmit={onSubmitForm}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
