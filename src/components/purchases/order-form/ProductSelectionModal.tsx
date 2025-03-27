
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogProduct } from "@/types/catalog";
import { Plus, Search } from "lucide-react";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: CatalogProduct[];
  addProductToOrder: (product: CatalogProduct) => void;
}

export const ProductSelectionModal = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  addProductToOrder
}: ProductSelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background enhanced-glass rounded-lg p-6 w-full max-w-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sélectionner des produits</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10 bg-black/70 border-0 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="py-4 border-b border-gray-700 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Ref: {product.reference || 'N/A'}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => addProductToOrder(product)}
                className="bg-black text-white hover:bg-black/80"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
