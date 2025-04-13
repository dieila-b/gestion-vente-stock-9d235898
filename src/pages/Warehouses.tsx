
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Warehouse, Archive, Building } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePOSLocationsQuery } from "@/hooks/pos-locations/use-pos-locations-query";

export default function Warehouses() {
  const navigate = useNavigate();
  // We'll create a stub for now - this would be connected to real warehouse data in the future
  const [warehouses, setWarehouses] = useState([
    { 
      id: "1", 
      name: "Entrepôt Principal", 
      location: "Alger Centre", 
      manager: "Ahmed Benali",
      capacity: 5000,
      occupied: 3200,
      status: "active"
    },
    { 
      id: "2", 
      name: "Dépôt Régional Est", 
      location: "Constantine", 
      manager: "Mohamed Saidi",
      capacity: 3500,
      occupied: 2100,
      status: "active"
    },
    { 
      id: "3", 
      name: "Entrepôt Secondaire", 
      location: "Oran", 
      manager: "Karim Hadj",
      capacity: 2800,
      occupied: 1900,
      status: "active"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // Filter warehouses based on search term
  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalWarehouses = warehouses.length;
  const totalCapacity = warehouses.reduce((acc, warehouse) => acc + warehouse.capacity, 0);
  const totalOccupied = warehouses.reduce((acc, warehouse) => acc + warehouse.occupied, 0);
  const occupationRate = Math.round((totalOccupied / totalCapacity) * 100);

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt?")) {
      setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader>
        <PageHeader.Title>Entrepôts de Stockage</PageHeader.Title>
        <PageHeader.Description>Gérez les entrepôts principaux et secondaires</PageHeader.Description>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total des Entrepôts</p>
              <h3 className="text-3xl font-bold mt-1">{totalWarehouses}</h3>
              <p className="text-xs text-green-500 mt-1">↑ 1.0%</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">
              <Warehouse className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="glass-panel p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Capacité Totale</p>
              <h3 className="text-3xl font-bold mt-1">{totalCapacity} m³</h3>
              <p className="text-xs text-green-500 mt-1">↑ 5.0%</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">
              <Archive className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="glass-panel p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taux d'Occupation</p>
              <h3 className="text-3xl font-bold mt-1">{occupationRate}%</h3>
              <p className="text-xs text-amber-500 mt-1">↑ 3.0%</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
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
                setIsDialogOpen(true);
              }}
            >
              <span className="text-lg font-bold">+</span>
              <span>Nouvel entrepôt</span>
            </button>
          </div>
        </div>
        
        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800">
                <TableHead>Nom</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((warehouse) => {
                  const occupationRate = Math.round((warehouse.occupied / warehouse.capacity) * 100);
                  return (
                    <TableRow key={warehouse.id} className="border-b border-slate-700">
                      <TableCell className="font-medium">{warehouse.name}</TableCell>
                      <TableCell>{warehouse.location}</TableCell>
                      <TableCell>{warehouse.capacity} m³</TableCell>
                      <TableCell>{occupationRate}%</TableCell>
                      <TableCell>{warehouse.manager}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {warehouse.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(warehouse)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(warehouse.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Aucun entrepôt trouvé</p>
                    <p className="text-sm text-muted-foreground mt-1">Essayez d'ajuster votre recherche ou d'ajouter un nouvel entrepôt</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog for adding/editing warehouses - would be expanded with form handling in a real implementation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedWarehouse ? "Modifier l'entrepôt" : "Ajouter un nouvel entrepôt"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-center text-sm text-muted-foreground">
              Formulaire à implémenter pour la gestion des entrepôts
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
