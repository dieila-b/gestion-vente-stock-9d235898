
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { formatGNF } from "@/lib/currency";

interface ProductsSectionProps {
  orderItems: PurchaseOrderItem[];
  removeProductFromOrder: (index: number) => void;
  updateProductQuantity: (index: number, quantity: number) => void;
  updateProductPrice: (index: number, price: number) => void;
  calculateTotal: () => number;
  setShowProductModal: (show: boolean) => void;
}

export const ProductsSection = ({
  orderItems,
  removeProductFromOrder,
  updateProductQuantity,
  updateProductPrice,
  calculateTotal,
  setShowProductModal,
}: ProductsSectionProps) => {
  
  // Nouvelle fonction pour gérer le changement de quantité
  const handleQuantityChange = (index: number, value: string) => {
    // Si la valeur est vide, on utilise 1 comme valeur par défaut
    if (value === "") {
      updateProductQuantity(index, 1);
      return;
    }
    
    // Sinon, on convertit la valeur en nombre
    const quantity = parseInt(value);
    updateProductQuantity(index, isNaN(quantity) ? 1 : quantity);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-white/80">Produits</Label>
        <Button
          type="button"
          variant="outline"
          className="neo-blur hover:bg-white/10"
          onClick={() => setShowProductModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>
      
      <div className="min-h-[50px] p-4 border border-dashed border-white/20 rounded-md">
        {orderItems.length === 0 ? (
          <p className="text-white/40 text-center">Aucun produit ajouté</p>
        ) : (
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={item.id} className="p-3 bg-white/5 rounded-md grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-2">
                  <p className="text-white font-medium">{item.product?.name || "Produit sans nom"}</p>
                  {item.product?.reference && <p className="text-xs text-white/60">Ref: {item.product.reference}</p>}
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    min="1"
                    className="neo-blur border-white/10"
                    placeholder="1"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateProductPrice(index, parseInt(e.target.value) || 0)}
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
                    onClick={() => removeProductFromOrder(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-right px-4 py-2 bg-white/5 rounded-md">
              <span className="text-white/60 mr-2">Sous-total produits:</span>
              <span className="text-white font-medium">{formatGNF(calculateTotal())}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
