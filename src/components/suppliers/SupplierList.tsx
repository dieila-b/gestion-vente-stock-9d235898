
import { SupplierCard } from "./SupplierCard";
import { Button } from "@/components/ui/button";
import { Package, FileText, Pencil, Trash2 } from "lucide-react";
import type { Supplier } from "@/types/supplier";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { SupplierEditDialog } from "./SupplierEditDialog";

interface SupplierListProps {
  suppliers: Supplier[];
  onCreateOrder: (supplier: Supplier) => void;
  onRequestPrice: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export const SupplierList = ({ 
  suppliers, 
  onCreateOrder, 
  onRequestPrice,
  onDeleteSupplier 
}: SupplierListProps) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-start">
        <Button
          className="glass-effect hover:scale-105 transition-transform"
          variant="outline"
          onClick={() => onCreateOrder(suppliers[0])}
        >
          <Package className="h-4 w-4 mr-2" />
          Nouvelle Commande
        </Button>
        <Button
          className="glass-effect hover:scale-105 transition-transform"
          variant="outline"
          onClick={() => onRequestPrice(suppliers[0])}
        >
          <FileText className="h-4 w-4 mr-2" />
          Demande de Prix
        </Button>
      </div>

      <div className="rounded-lg border enhanced-glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="font-semibold">Nom</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Téléphone</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-white/5">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    supplier.status === "Actif" ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                    supplier.status === "En attente" ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                    'bg-red-500/20 text-red-500 border border-red-500/20'
                  }`}>
                    {supplier.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-effect hover:bg-primary/20 hover:text-primary"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-effect hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-panel">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le fournisseur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le fournisseur {supplier.name} ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteSupplier(supplier.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedSupplier && (
        <SupplierEditDialog
          supplier={selectedSupplier}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
};
