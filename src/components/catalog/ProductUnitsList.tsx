
import { useState } from "react";
import { useProductUnits } from "@/hooks/use-product-units";
import { useProductUnitsMutations } from "@/hooks/use-product-units-mutations";
import { Button } from "@/components/ui/button";
import { ProductUnit } from "@/types/catalog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ProductUnitForm } from "./ProductUnitForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ProductUnitsList() {
  const { units } = useProductUnits();
  const { deleteUnitMutation } = useProductUnitsMutations();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter units based on search query
  const filteredUnits = units?.filter(unit => 
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (unit.description && unit.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleAddUnit = () => {
    setSelectedUnit(null);
    setIsAddDialogOpen(true);
  };

  const handleEditUnit = (unit: ProductUnit) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUnit = (unit: ProductUnit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUnit) {
      await deleteUnitMutation.mutate(selectedUnit);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gradient">Unités de Mesure</h1>
        <Button onClick={handleAddUnit} className="enhanced-glass">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Unité
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher une unité..."
          className="pl-10 enhanced-glass"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden enhanced-glass">
        <div className="bg-white/5 px-4 py-2 border-b border-white/10">
          <h2 className="text-lg font-semibold text-gradient">Liste des Unités</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/80">Nom</TableHead>
              <TableHead className="text-white/80">Symbole</TableHead>
              <TableHead className="text-white/80">Description</TableHead>
              <TableHead className="text-right text-white/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "Aucune unité trouvée pour cette recherche" : "Aucune unité disponible"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map((unit) => (
                <TableRow key={unit.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{unit.name}</TableCell>
                  <TableCell>{unit.symbol}</TableCell>
                  <TableCell className="text-muted-foreground">{unit.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="enhanced-glass"
                        onClick={() => handleEditUnit(unit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="enhanced-glass"
                        onClick={() => handleDeleteUnit(unit)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une Nouvelle Unité</DialogTitle>
          </DialogHeader>
          <ProductUnitForm 
            isOpen={isAddDialogOpen}
            unit={null}
            onClose={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'Unité</DialogTitle>
          </DialogHeader>
          {selectedUnit && (
            <ProductUnitForm 
              isOpen={isEditDialogOpen}
              unit={selectedUnit} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'unité "{selectedUnit?.name}"? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
