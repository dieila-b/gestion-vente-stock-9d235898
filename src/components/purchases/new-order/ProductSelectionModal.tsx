
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
  
  console.log("ProductSelectionModal - products:", products?.length || 0);
  console.log("ProductSelectionModal - isLoading:", isLoading);
  console.log("ProductSelectionModal - error:", error);
  console.log("ProductSelectionModal - products data:", products);
  console.log("ProductSelectionModal - search query:", searchQuery);
  
  // Améliorer la logique de filtrage avec une meilleure gestion des valeurs nulles/undefined
  const filteredProducts = products.filter(product => {
    // Vérifier que le produit a au moins un nom ou une référence
    if (!product.name && !product.reference) {
      console.log("Produit ignoré - aucun nom ni référence:", product);
      return false;
    }

    const productName = (product.name || "").toLowerCase();
    const productReference = (product.reference || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    
    console.log("Filtering product:", {
      id: product.id,
      name: product.name,
      reference: product.reference,
      nameMatch: productName.includes(query),
      refMatch: productReference.includes(query)
    });
    
    // Si pas de recherche, afficher tous les produits valides
    if (!query) {
      return true;
    }
    
    return productName.includes(query) || productReference.includes(query);
  });

  console.log("ProductSelectionModal - filtered products:", filteredProducts?.length || 0);
  console.log("ProductSelectionModal - filtered products data:", filteredProducts);

  const handleAddProduct = (product: CatalogProduct) => {
    console.log("Adding product:", product);
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
        name: product.name || "Produit sans nom",
        reference: product.reference || ""
      }
    };
    
    onAddProduct(newItem);
    onClose();
  };

  const handleAddEmptyProduct = () => {
    console.log("Adding empty product");
    const emptyProductId = crypto.randomUUID();
    
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      purchase_order_id: "",
      product_id: "",
      quantity: 1,
      unit_price: 0,
      selling_price: 0,
      total_price: 0,
      product: {
        id: emptyProductId,
        name: "Produit manuel",
        reference: ""
      }
    };
    
    onAddProduct(newItem);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white">
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
          </div>

          <div className="h-[300px] overflow-y-auto border border-white/10 rounded-md p-2 bg-black/20">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-white/60">
                <p>Chargement des produits...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <p className="mb-2">Erreur de chargement des produits</p>
                <p className="text-sm text-red-400 mb-4">Erreur: {error.message}</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddEmptyProduct}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Ajouter un produit manuel
                </Button>
              </div>
            ) : !products || products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <p className="mb-4">Aucun produit disponible dans le catalogue</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddEmptyProduct}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Ajouter un produit manuel
                </Button>
              </div>
            ) : filteredProducts.length === 0 && searchQuery.trim() !== "" ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <p className="mb-4">Aucun produit correspondant à "{searchQuery}"</p>
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
                {filteredProducts.map(product => {
                  console.log("Rendering product:", product);
                  
                  // Assurer l'affichage correct du nom et de la référence
                  const displayName = product.name || "Produit sans nom";
                  const displayReference = product.reference || "Sans référence";
                  const displayPrice = product.purchase_price || 0;
                  const displayStock = product.stock || 0;
                  
                  return (
                    <div 
                      key={product.id} 
                      className="p-3 border border-white/10 rounded bg-white/5 hover:bg-white/10 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-white/60">
                          Ref: {displayReference}
                        </p>
                        {product.category && (
                          <p className="text-xs text-white/40">
                            Catégorie: {product.category}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{displayPrice} GNF</p>
                        <p className="text-xs text-white/60">Stock: {displayStock}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="border-white/20 text-white">
              Annuler
            </Button>
            <Button onClick={handleAddEmptyProduct} className="bg-white/10 hover:bg-white/20 text-white">
              Nouveau produit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
