
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: any) => void;
}

export const ProductSelectionModal = ({
  open,
  onClose,
  onAddProduct,
}: ProductSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  // This would typically come from a hook or API call
  const products = []; 

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="h-[300px] overflow-y-auto border rounded-md p-2">
            {products.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucun produit trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {/* Products would be listed here */}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={() => {
              // For now, just add a dummy product
              onAddProduct({
                id: Math.random().toString(),
                name: "Nouveau produit",
                quantity: 1,
                unit_price: 0,
                total_price: 0
              });
            }}>
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
