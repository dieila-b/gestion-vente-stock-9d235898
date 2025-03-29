
import { Search, Filter, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WarehouseTable } from "./WarehouseTable";
import { useState } from "react";
import { Warehouse } from "@/hooks/use-warehouse";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { WarehouseForm } from "./WarehouseForm";

interface WarehouseListProps {
  warehouses: Warehouse[];
  onAddNew: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => Promise<void>;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  selectedWarehouse: Warehouse | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function WarehouseList({ 
  warehouses, 
  onAddNew,
  onEdit,
  onDelete,
  isAddDialogOpen,
  setIsAddDialogOpen,
  selectedWarehouse,
  handleSubmit
}: WarehouseListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWarehouses = warehouses?.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Card className="enhanced-glass p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gradient">Liste des Entrepôts</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-effect"
              />
            </div>
            <Button variant="outline" className="glass-effect">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Button onClick={onAddNew} className="glass-effect">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        <WarehouseTable 
          warehouses={filteredWarehouses} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedWarehouse ? "Modifier l'entrepôt" : "Ajouter un nouvel entrepôt"}
            </DialogTitle>
          </DialogHeader>
          <WarehouseForm
            warehouse={selectedWarehouse}
            onSubmit={handleSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
