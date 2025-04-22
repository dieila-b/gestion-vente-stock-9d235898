
import { Button } from "@/components/ui/button";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { CatalogProduct } from "@/types/catalog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useState } from "react";
import { ProductSelectionModal } from "@/components/purchases/edit/FormSections/ProductSelectionModal";
import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";

interface ProductsSectionProps {
  items: PurchaseOrderItem[];
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  updateItemPrice: (itemId: string, price: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  addItem: (product: CatalogProduct) => Promise<boolean>;
}

export function ProductsSection({
  items,
  updateItemQuantity,
  updateItemPrice,
  removeItem,
  addItem
}: ProductsSectionProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  console.log("Product section rendering with items:", items.length);

  // Fetch available products
  const { data: products = [] } = useQuery<CatalogProduct[]>({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as CatalogProduct[];
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white/70">Articles ({items.length})</h3>
        </div>
        <Button 
          onClick={() => setIsProductModalOpen(true)}
          variant="outline"
          className="neo-blur"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-black/40 rounded-md p-6 text-center border border-white/10 neo-blur">
          <p className="text-white/60">Aucun produit ajouté à ce bon de commande</p>
          <Button 
            onClick={() => setIsProductModalOpen(true)}
            variant="outline"
            className="mt-4 neo-blur"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 p-2 text-sm text-white/60 font-medium">
            <div className="col-span-4">Produit</div>
            <div className="col-span-2 text-center">Quantité</div>
            <div className="col-span-2 text-center">Prix unitaire</div>
            <div className="col-span-3 text-center">Prix total</div>
            <div className="col-span-1"></div>
          </div>
          
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center rounded-md border border-white/10 bg-black/40 neo-blur">
              <div className="col-span-4">
                <div className="font-medium text-white">{item.product?.name || "Produit inconnu"}</div>
                <div className="text-xs text-white/60">{item.product?.reference || "Sans référence"}</div>
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                  className="text-center neo-blur"
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.unit_price}
                  min={0}
                  onChange={(e) => updateItemPrice(item.id, parseInt(e.target.value))}
                  className="text-center neo-blur"
                />
              </div>
              
              <div className="col-span-3 text-center font-medium">
                {formatGNF(item.quantity * item.unit_price)}
              </div>
              
              <div className="col-span-1 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
        onSelectProduct={(product) => {
          addItem(product);
          setIsProductModalOpen(false);
        }}
      />
    </div>
  );
}
