
import { Button } from "@/components/ui/button";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { CatalogProduct } from "@/types/catalog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from "react";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { Plus, Trash, Loader } from "lucide-react";
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
  items = [],
  updateItemQuantity,
  updateItemPrice,
  removeItem,
  addItem
}: ProductsSectionProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionItemId, setActionItemId] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("ProductsSection rendered with items:", items?.length || 0);
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        if (index < 3) { // Only log a few items to avoid console spam
          console.log(`Item ${index}:`, {
            id: item.id,
            productId: item.product_id,
            name: item.product?.name || 'Unknown product',
            quantity: item.quantity,
            price: item.unit_price
          });
        }
      });
    } else {
      console.log("No items available to render");
    }
  }, [items]);
  
  // Fetch available products
  const { data: products = [], isLoading: productsLoading } = useQuery<CatalogProduct[]>({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      console.log("Fetching catalog products...");
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
          
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
        
      console.log("Fetched catalog products:", data?.length || 0);
      return data as CatalogProduct[];
    },
    staleTime: 60000, // 1 minute
  });

  // Handle product addition
  const handleAddProduct = async (product: CatalogProduct) => {
    console.log("Handling add product:", product);
    setIsLoading(true);
    try {
      const success = await addItem(product);
      if (success) {
        setIsProductModalOpen(false);
        setSearchQuery("");
        console.log("Product added successfully");
      } else {
        console.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    setActionItemId(itemId);
    setIsLoading(true);
    try {
      await removeItem(itemId);
    } finally {
      setIsLoading(false);
      setActionItemId(null);
    }
  };

  // Handle quantity change with debouncing
  const handleQuantityChange = async (itemId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      setActionItemId(itemId);
      setIsLoading(true);
      try {
        await updateItemQuantity(itemId, quantity);
      } finally {
        setIsLoading(false);
        setActionItemId(null);
      }
    }
  };

  // Handle price change with debouncing
  const handlePriceChange = async (itemId: string, value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setActionItemId(itemId);
      setIsLoading(true);
      try {
        await updateItemPrice(itemId, price);
      } finally {
        setIsLoading(false);
        setActionItemId(null);
      }
    }
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  console.log("Rendering ProductsSection with", items.length, "items");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white">Articles de la commande</h3>
          <p className="text-sm text-white/60">Gérez les articles, quantités et prix ({items.length} article{items.length !== 1 ? 's' : ''})</p>
        </div>
        <Button 
          onClick={() => setIsProductModalOpen(true)}
          variant="outline"
          className="neo-blur"
          disabled={isLoading || productsLoading}
        >
          {(isLoading && !actionItemId) || productsLoading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Ajouter un produit
        </Button>
      </div>

      {!items || items.length === 0 ? (
        <div className="bg-black/40 rounded-lg p-8 text-center border border-white/10 neo-blur">
          <div className="max-w-md mx-auto">
            <div className="text-white/40 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-white/60 mb-4">Aucun produit ajouté à ce bon de commande</p>
            <Button 
              onClick={() => setIsProductModalOpen(true)}
              variant="outline"
              className="neo-blur"
              disabled={isLoading || productsLoading}
            >
              {isLoading || productsLoading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Ajouter votre premier produit
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 p-3 text-sm text-white/60 font-medium bg-black/20 rounded-lg border border-white/5">
            <div className="col-span-4">Produit</div>
            <div className="col-span-2 text-center">Quantité</div>
            <div className="col-span-2 text-center">Prix unitaire (GNF)</div>
            <div className="col-span-3 text-center">Total (GNF)</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          {/* Items */}
          {items.map((item) => {
            const itemTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
            return (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center rounded-lg border border-white/10 bg-black/40 neo-blur hover:bg-black/50 transition-colors">
                <div className="col-span-4">
                  <div className="font-medium text-white">
                    {item.product?.name || "Produit inconnu"}
                  </div>
                  <div className="text-xs text-white/60">
                    Réf: {item.product?.reference || "Sans référence"}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity || 0}
                    min={1}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="text-center neo-blur"
                    disabled={isLoading && actionItemId === item.id}
                  />
                  {isLoading && actionItemId === item.id && (
                    <div className="text-xs text-white/60 mt-1 text-center">Mise à jour...</div>
                  )}
                </div>
                
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.unit_price || 0}
                    min={0}
                    step="0.01"
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="text-center neo-blur"
                    disabled={isLoading && actionItemId === item.id}
                  />
                </div>
                
                <div className="col-span-3 text-center">
                  <div className="font-medium text-white">
                    {formatGNF(itemTotal)}
                  </div>
                  <div className="text-xs text-white/60">
                    {item.quantity} × {formatGNF(Number(item.unit_price || 0))}
                  </div>
                </div>
                
                <div className="col-span-1 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    disabled={isLoading && actionItemId === item.id}
                  >
                    {isLoading && actionItemId === item.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Summary row */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 rounded-lg border border-white/20">
            <div className="col-span-8"></div>
            <div className="col-span-3 text-center">
              <div className="text-sm text-white/60 mb-1">Total général</div>
              <div className="font-bold text-lg text-white">
                {formatGNF(calculateGrandTotal())}
              </div>
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>
      )}

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products || []}
        onSelectProduct={handleAddProduct}
        isLoading={productsLoading || isLoading}
      />
    </div>
  );
}
