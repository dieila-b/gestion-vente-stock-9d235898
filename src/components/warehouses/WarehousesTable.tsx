
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Warehouse } from "@/types/warehouse";

interface WarehousesTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
}

export function WarehousesTable({ warehouses, onEdit, onDelete }: WarehousesTableProps) {
  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">Aucun entrepôt trouvé</p>
        <p className="text-sm text-muted-foreground">Ajoutez un nouvel entrepôt pour commencer</p>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-800">
            <TableHead>Nom</TableHead>
            <TableHead>Localisation</TableHead>
            <TableHead>Surface</TableHead>
            <TableHead>Capacité</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => {
            // Calculer le taux d'occupation
            const occupationRate = warehouse.capacity > 0 
              ? Math.round((warehouse.occupied / warehouse.capacity) * 100) 
              : 0;
            
            return (
              <TableRow key={warehouse.id} className="border-b border-slate-700">
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell>{warehouse.location}</TableCell>
                <TableCell>{warehouse.surface} m²</TableCell>
                <TableCell>{warehouse.capacity}</TableCell>
                <TableCell>{occupationRate}%</TableCell>
                <TableCell>{warehouse.manager}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    warehouse.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {warehouse.is_active ? "Actif" : "Inactif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(warehouse)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(warehouse)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
