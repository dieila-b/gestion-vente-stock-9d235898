
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/use-products";
import { CatalogProduct } from "@/types/catalog";
import { PurchaseOrderItem } from "@/types/purchase-order";

interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: PurchaseOrderItem) => void;
}

export const ProductSelectionModal = ({
  open,
  onClose,
  onAddProduct,
}: ProductSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { products, isLoading, error } = useProducts();
  
  console.log("ProductSelectionModal - Products:", products?.length || 0);
  
  // Filter products based on search
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const productName = (product.name || "").toLowerCase();
    const productReference = (product.reference || "").toLowerCase();
    
    return productName.includes(query) || productReference.includes(query);
  });

  const handleAddProduct = (product: CatalogProduct) => {
    console.log("Adding product:", product.name);
    
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      purchase_order_id: "",
      product_id: product.id,
      quantity: 1,
      unit_price: product.purchase_price || 0,
      selling_price: product.price || 0,
      total_price: product.purchase_price || 0,
      product: {
        id: product.id,
        name: product.name,
        reference: product.reference || ""
      }
    };
    
    onAddProduct(newItem);
    onClose();
  };

  const handleAddEmptyProduct = () => {
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      purchase_order_id: "",
      product_id: "",
      quantity: 1,
      unit_price: 0,
      selling_price: 0,
      total_price: 0,
      product: {
        id: crypto.randomUUID(),
        name: "Produit manuel",
        reference: ""
      }
    };
    
    onAddProduct(newItem);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-black/90 border-white/10 text-white">
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
                className="pl-8 bg-black/50 border-white/10 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleAddEmptyProduct}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Nouveau produit
            </Button>
          </div>

          <div className="h-[400px] overflow-y-auto border border-white/10 rounded-md p-2 bg-black/20">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-white/60">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Chargement des produits...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                <p className="mb-2 text-center">Erreur de chargement</p>
                <p className="text-sm text-red-400 mb-4 text-center">
                  {error.message}
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleAddEmptyProduct}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Ajouter un produit manuel
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <AlertCircle className="h-8 w-8 text-yellow-400 mb-2" />
                <p className="mb-2 text-center">Aucun produit dans le catalogue</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddEmptyProduct}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Ajouter un produit manuel
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <Search className="h-8 w-8 text-blue-400 mb-2" />
                <p className="mb-2 text-center">Aucun résultat pour "{searchQuery}"</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddEmptyProduct}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Ajouter un produit manuel
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-white/60 mb-2">
                  {filteredProducts.length} produit(s) trouvé(s)
                </div>
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="p-3 border border-white/10 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex justify-between items-center"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{product.name}</p>
                      <div className="flex gap-4 text-xs text-white/60 mt-1">
                        <span>Ref: {product.reference || "Non définie"}</span>
                        {product.category && (
                          <span>Catégorie: {product.category}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-green-400">
                        {product.purchase_price ? `${product.purchase_price.toLocaleString()} GNF` : 'Prix à définir'}
                      </p>
                      <p className="text-xs text-white/60">
                        Stock: {product.stock} • Vente: {product.price.toLocaleString()} GNF
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-white/60">
              {products.length} produit(s) total
            </div>
            <Button variant="outline" onClick={onClose} className="border-white/20 text-white">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
