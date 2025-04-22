
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogProduct } from "@/types/catalog";
import { Plus, Search, X } from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: CatalogProduct[];
  onSelectProduct: (product: CatalogProduct) => void;
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  products,
  onSelectProduct
}: ProductSelectionModalProps) {
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
            className="hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10 enhanced-glass"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun produit trouvé
            </div>
          ) : (
            products.map(product => (
              <div
                key={product.id}
                className="py-4 border-b border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors rounded-md px-2"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatGNF(product.price || 0)} - Ref: {product.reference || 'N/A'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSelectProduct(product)}
                  className="neo-blur"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
