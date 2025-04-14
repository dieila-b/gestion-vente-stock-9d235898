
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { Trash, Plus } from "lucide-react";

interface ProductsSectionProps {
  items: PurchaseOrderItem[];
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemPrice?: (itemId: string, price: number) => void;
  setShowProductModal?: (show: boolean) => void;
}

export function ProductsSection({ 
  items, 
  updateItemQuantity, 
  updateItemPrice, 
  setShowProductModal 
}: ProductsSectionProps) {
  // Fonction pour gérer le changement de quantité
  const handleQuantityChange = (itemId: string, value: string) => {
    // Si la valeur est vide, on laisse le champ vide pour l'édition
    if (value === "") {
      updateItemQuantity(itemId, 0);
      return;
    }
    
    // Sinon, on convertit la valeur en nombre
    const quantity = parseInt(value);
    updateItemQuantity(itemId, isNaN(quantity) ? 0 : quantity);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Produits</h3>
        {setShowProductModal && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowProductModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        )}
      </div>
      
      <div className="min-h-[50px] p-4 border border-dashed border-white/20 rounded-md">
        {items.length === 0 ? (
          <p className="text-white/40 text-center">Aucun produit ajouté</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-3 bg-white/5 rounded-md grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-2">
                  <p className="text-white font-medium">{item.product?.name || "Produit sans nom"}</p>
                  {item.product?.reference && <p className="text-xs text-white/60">Ref: {item.product.reference}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="neo-blur border-white/10"
                    placeholder="1"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItemPrice && updateItemPrice(item.id, parseInt(e.target.value) || 0)}
                    min="0"
                    className="neo-blur border-white/10"
                  />
                </div>
                <div>
                  <span className="text-white/80">{formatGNF(item.total_price)}</span>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-right px-4 py-2 bg-white/5 rounded-md">
              <span className="text-white/60 mr-2">Sous-total produits:</span>
              <span className="text-white font-medium">
                {formatGNF(items.reduce((total, item) => total + item.total_price, 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
