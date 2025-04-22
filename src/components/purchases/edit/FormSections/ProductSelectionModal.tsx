
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Loader } from "lucide-react";
import { CatalogProduct } from "@/types/catalog";
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
  products = [],
  onSelectProduct,
  isLoading = false
}: ProductSelectionModalProps) {
  const [filteredProducts, setFilteredProducts] = useState<CatalogProduct[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Filter products based on search query when products or searchQuery changes
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
    console.log("ProductSelectionModal - Available products:", products.length);
    
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      console.log("ProductSelectionModal - Filtered products:", filtered.length);
    } else {
      setFilteredProducts(products);
      console.log("ProductSelectionModal - All products shown:", products.length);
    }
  }, [searchQuery, products]);

  // Handle product selection with loading state
  const handleSelectProduct = async (product: CatalogProduct) => {
    if (!product || isSelecting) return;
    
    try {
      setIsSelecting(true);
      console.log("Selecting product:", product.name);
      await onSelectProduct(product);
    } catch (error) {
      console.error("Error selecting product:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black border border-white/10 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden neo-blur">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-medium">Sélectionner un produit</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white"
            disabled={isLoading || isSelecting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 neo-blur"
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="h-6 w-6 animate-spin text-white/60 mr-2" />
              <span className="text-white/60">Chargement des produits...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto p-1">
              {!filteredProducts || filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  {!products || products.length === 0 ? "Aucun produit disponible" : "Aucun produit trouvé"}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 bg-white/5 rounded-md flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <div className="flex text-sm text-white/60 space-x-4">
                        <span>Ref: {product.reference || "N/A"}</span>
                        <span>Prix: {formatGNF(product.purchase_price || 0)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectProduct(product)}
                      className="neo-blur"
                      disabled={isSelecting}
                    >
                      {isSelecting ? (
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Ajouter
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
