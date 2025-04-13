
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WarehouseStats } from "@/components/warehouses/WarehouseStats";
import { WarehouseSearch } from "@/components/warehouses/WarehouseSearch";
import { WarehouseTable, Warehouse } from "@/components/warehouses/WarehouseTable";
import { WarehouseForm, WarehouseFormValues } from "@/components/warehouses/WarehouseForm";
import { db } from "@/utils/db-adapter";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWarehouses = warehouses.length;
  const totalCapacity = warehouses.reduce((acc, warehouse) => acc + warehouse.capacity, 0);
  const totalOccupied = warehouses.reduce((acc, warehouse) => acc + warehouse.occupied, 0);
  const occupationRate = Math.round((totalOccupied / totalCapacity) * 100) || 0;

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt?")) {
      try {
        const success = await db.delete('warehouses', 'id', id);
        
        if (success) {
          setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
          toast.success("Entrepôt supprimé avec succès");
        } else {
          toast.error("Erreur lors de la suppression de l'entrepôt");
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'entrepôt:', error);
        toast.error("Erreur lors de la suppression de l'entrepôt");
      }
    }
  };

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        // Removed the generic type argument from db.query
        const data = await db.query('warehouses', 
          (query) => query.select('*').order('name', { ascending: true }),
          []
        );
        
        if (data && data.length > 0) {
          setWarehouses(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entrepôts:', error);
        toast.error("Erreur lors du chargement des entrepôts");
      }
    };
    
    fetchWarehouses();
  }, []);

  const onSubmit = async (values: WarehouseFormValues) => {
    setIsSubmitting(true);
    try {
      const warehouseData = {
        name: values.name,
        location: values.location,
        capacity: values.capacity,
        surface: values.surface,
        manager: values.manager,
        status: values.status || 'Actif',
        is_active: values.is_active,
        occupied: 0
      };

      console.log("Données de l'entrepôt à envoyer:", warehouseData);

      // Removed the generic type argument from db.insert
      const newWarehouse = await db.insert('warehouses', warehouseData);
      
      if (newWarehouse) {
        setWarehouses([...warehouses, newWarehouse]);
        toast.success("Entrepôt ajouté avec succès");
        setIsDialogOpen(false);
      } else {
        toast.error("Erreur lors de l'ajout de l'entrepôt");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrepôt:', error);
      toast.error("Erreur lors de l'ajout de l'entrepôt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader>
        <PageHeader.Title>Entrepôts de Stockage</PageHeader.Title>
        <PageHeader.Description>Gérez les entrepôts principaux et secondaires</PageHeader.Description>
      </PageHeader>
      
      <WarehouseStats
        totalWarehouses={totalWarehouses}
        totalCapacity={totalCapacity}
        totalOccupied={totalOccupied}
        occupationRate={occupationRate}
      />
      
      <Card className="glass-panel p-4">
        <WarehouseSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddWarehouseClick={() => {
            setSelectedWarehouse(null);
            setIsDialogOpen(true);
          }}
        />
        
        <WarehouseTable
          warehouses={filteredWarehouses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedWarehouse ? "Modifier l'entrepôt" : "Ajouter un nouvel entrepôt"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour {selectedWarehouse ? "modifier" : "ajouter"} un entrepôt.
            </DialogDescription>
          </DialogHeader>
          <WarehouseForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            selectedWarehouse={selectedWarehouse}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
