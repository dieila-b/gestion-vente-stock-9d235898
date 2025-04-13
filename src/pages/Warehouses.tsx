
import { Card } from "@/components/ui/card";
import { WarehousesTable } from "@/components/warehouses/WarehousesTable";
import { WarehouseForm } from "@/components/warehouses/WarehouseForm";
import { useWarehouse } from "@/hooks/use-warehouse";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Warehouse } from "@/types/warehouse";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Building2, AreaChart, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function Warehouses() {
  const {
    warehouses,
    selectedWarehouse,
    setSelectedWarehouse,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete
  } = useWarehouse();
  
  const [searchTerm, setSearchTerm] = useState("");

  const onEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsAddDialogOpen(true);
  };

  const onDeleteWarehouse = (warehouse: Warehouse) => {
    handleDelete(warehouse.id);
  };

  const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const warehouseData: Partial<Warehouse> = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      location: formData.get('location') as string,
      manager: formData.get('manager') as string,
      status: formData.get('status') as string,
      is_active: formData.get('is_active') === 'true',
      capacity: parseInt(formData.get('capacity') as string) || 0,
      occupied: parseInt(formData.get('occupied') as string) || 0,
      surface: parseInt(formData.get('surface') as string) || 0
    };
    
    if (selectedWarehouse?.id) {
      warehouseData.id = selectedWarehouse.id;
    }
    
    handleSubmit(warehouseData as Warehouse);
  };

  const totalWarehouses = warehouses?.length || 0;
  const totalSurface = warehouses?.reduce((total, wh) => total + (wh.surface || 0), 0) || 0;
  
  let occupationRate = 0;
  if (totalWarehouses > 0) {
    const totalCapacity = warehouses?.reduce((total, wh) => total + (wh.capacity || 0), 0) || 0;
    const totalOccupied = warehouses?.reduce((total, wh) => total + (wh.occupied || 0), 0) || 0;
    occupationRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  }

  const filteredWarehouses = warehouses?.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header className="sticky top-0 z-50" />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-background/90 w-full -ml-px">
          <div className="p-4 space-y-6">
            <PageHeader>
              <PageHeader.Title>Entrepôts</PageHeader.Title>
              <PageHeader.Description>Gérez vos entrepôts et espaces de stockage</PageHeader.Description>
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-panel p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entrepôts</p>
                    <h3 className="text-3xl font-bold mt-1">{totalWarehouses}</h3>
                    <p className="text-xs text-green-500 mt-1">↑ 2.0%</p>
                  </div>
                  <div className="rounded-full p-3 bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </Card>
              
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
                <h2 className="text-xl font-bold text-primary">Liste des Entrepôts</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher un entrepôt..."
                      className="pl-9 w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-1"
                    onClick={() => {
                      setSelectedWarehouse(null);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <span className="text-lg font-bold">+</span>
                    <span>Nouvel entrepôt</span>
                  </button>
                </div>
              </div>
              
              <WarehousesTable
                warehouses={filteredWarehouses || []} 
                onEdit={onEditWarehouse}
                onDelete={onDeleteWarehouse}
              />
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="sm:max-w-md glass-panel">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {selectedWarehouse ? "Modifier l'entrepôt" : "Ajouter un nouvel entrepôt"}
                  </DialogTitle>
                </DialogHeader>
                <WarehouseForm
                  warehouse={selectedWarehouse as Warehouse}
                  onSubmit={onSubmitForm}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
