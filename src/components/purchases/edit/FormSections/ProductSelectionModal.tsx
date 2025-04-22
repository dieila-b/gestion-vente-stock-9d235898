
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatGNF } from "@/lib/currency";
import { Search } from "lucide-react";
import { CatalogProduct } from "@/types/catalog";

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
  // Filter products safely with null checks
  const filteredProducts = products.filter(product => {
    if (!product) return false; // Skip invalid products
    if (!searchQuery) return true; // Show all products when no search query
    
    const productName = product.name?.toLowerCase() || '';
    const productReference = product.reference?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return productName.includes(query) || productReference.includes(query);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Rechercher un produit par nom ou référence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 neo-blur"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="text-white/60 col-span-full text-center py-8">
                {searchQuery ? "Aucun produit ne correspond à votre recherche" : "Aucun produit disponible"}
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{product.name || 'Sans nom'}</h4>
                      <p className="text-xs text-white/60">
                        Ref: {product.reference || "N/A"}
                      </p>
                      <p className="text-sm text-white/80 mt-2">
                        {formatGNF(product.purchase_price || 0)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
