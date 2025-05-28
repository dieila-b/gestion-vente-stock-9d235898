
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CatalogProduct } from "@/types/catalog";
import { Loader, Plus } from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: CatalogProduct[];
  onSelectProduct: (product: CatalogProduct) => void;
  isLoading?: boolean;
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  products,
  onSelectProduct,
  isLoading = false
}: ProductSelectionModalProps) {
  const filteredProducts = products.filter(product => {
    const productName = (product.name || '').toString();
    const productReference = (product.reference || '').toString();
    const query = (searchQuery || '').toLowerCase();
    
    return productName.toLowerCase().includes(query) ||
           productReference.toLowerCase().includes(query);
  });

  const handleSelectProduct = (product: CatalogProduct) => {
    onSelectProduct(product);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner un produit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="neo-blur"
          />
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                {searchQuery ? "Aucun produit trouvé" : "Aucun produit disponible"}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-md border border-white/10 bg-black/40 neo-blur hover:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{product.name || "Produit sans nom"}</div>
                    <div className="text-sm text-white/60">
                      Réf: {product.reference || "Sans référence"} | 
                      Stock: {product.stock || 0} | 
                      Prix achat: {formatGNF(product.purchase_price || 0)}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectProduct(product)}
                    variant="outline"
                    size="sm"
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
      </DialogContent>
    </Dialog>
  );
}
