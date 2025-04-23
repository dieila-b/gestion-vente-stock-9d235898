import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader, X } from "lucide-react";
import { CatalogProduct } from "@/types/catalog";
import { v4 as uuidv4 } from "uuid";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: CatalogProduct[];
  onSelectProduct: (product: CatalogProduct) => void;
  isLoading: boolean;
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  products,
  onSelectProduct,
  isLoading
}: ProductSelectionModalProps) {
  const [filteredProducts, setFilteredProducts] = useState<CatalogProduct[]>([]);
  
  // Filter products when search query changes
  useEffect(() => {
    if (!products) {
      setFilteredProducts([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => 
      (product.name?.toLowerCase().includes(query)) || 
      (product.reference?.toLowerCase().includes(query))
    );
    
    setFilteredProducts(filtered);
  }, [searchQuery, products]);
  
  const handleAddEmptyProduct = () => {
    // Create a complete CatalogProduct object with all required properties
    const emptyProduct: CatalogProduct = {
      id: uuidv4(),
      name: "Produit manuel",
      description: "",
      price: 0,
      purchase_price: 0,
      category: "",
      stock: 0,
      reference: "MANUAL-" + Date.now(),
      created_at: new Date().toISOString()
    };
    
    onSelectProduct(emptyProduct);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Sélectionner un produit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/60" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8 bg-black/50 border-white/10 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="h-[300px] overflow-y-auto border border-white/10 rounded-md p-2 bg-black/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Loader className="h-6 w-6 animate-spin mb-2 text-white/60" />
                <p className="text-white/60">Chargement des produits...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <p className="text-white/60 mb-4">Aucun produit trouvé</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddEmptyProduct}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit manuel
                </Button>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="p-3 border border-white/10 rounded bg-white/5 hover:bg-white/10 cursor-pointer flex justify-between items-center"
                    onClick={() => onSelectProduct(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-white/60">
                        {product.reference ? `Ref: ${product.reference}` : "Sans référence"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{product.purchase_price ? `${product.purchase_price} GNF` : "Sans prix"}</p>
                      <p className="text-xs text-white/60">Stock: {product.stock || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="border-white/20 text-white">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
