
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
  const { products } = useProducts();
  
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: CatalogProduct) => {
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      purchase_order_id: "",
      product_id: product.id,
      quantity: 1,
      unit_price: product.purchase_price || 0,
      selling_price: product.price || 0,
      total_price: product.purchase_price || 0,
      product: {
        id: product.id, // Include the id property to match the updated type
        name: product.name,
        reference: product.reference
      }
    };
    
    onAddProduct(newItem);
    onClose();
  };

  const handleAddEmptyProduct = () => {
    // Create a unique ID for the empty product
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
        id: emptyProductId, // Add a generated ID for the empty product
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
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <p className="mb-4">Aucun produit correspondant trouvé</p>
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
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="p-3 border border-white/10 rounded bg-white/5 hover:bg-white/10 cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddProduct(product)}
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
