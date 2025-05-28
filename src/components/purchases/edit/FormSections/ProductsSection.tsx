
import { Button } from "@/components/ui/button";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { CatalogProduct } from "@/types/catalog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from "react";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { Plus, Trash, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  
  // Log pour debugging
  useEffect(() => {
    console.log("ProductsSection received items:", items?.length || 0);
    if (items && items.length > 0) {
      console.log("First item:", items[0]);
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
    console.log("Adding product:", product);
    try {
      const success = await addItem(product);
      if (success) {
        setIsProductModalOpen(false);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
    try {
      await removeItem(itemId);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (itemId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      setLoadingItems(prev => new Set(prev).add(itemId));
      try {
        await updateItemQuantity(itemId, quantity);
      } finally {
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    }
  };

  // Handle price change
  const handlePriceChange = async (itemId: string, value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setLoadingItems(prev => new Set(prev).add(itemId));
      try {
        await updateItemPrice(itemId, price);
      } finally {
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    }
  };

  // Show loading state during initial load
  if (!items) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-8">
          <Loader className="h-6 w-6 animate-spin mr-2" />
          <span className="text-white/60">Chargement des produits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsProductModalOpen(true)}
          variant="outline"
          className="neo-blur"
          disabled={productsLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Products List */}
      {items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const itemTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
            const isLoading = loadingItems.has(item.id);
            
            return (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-black/40 neo-blur">
                {/* Product Selection */}
                <div className="flex-1">
                  <Select value={item.product_id} disabled>
                    <SelectTrigger className="neo-blur">
                      <SelectValue>
                        {item.product?.name || "Produit inconnu"}
                      </SelectValue>
                    </SelectTrigger>
                  </Select>
                </div>
                
                {/* Quantity */}
                <div className="w-24">
                  <Input
                    type="number"
                    value={item.quantity || 0}
                    min={1}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="text-center neo-blur"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Unit Price */}
                <div className="w-32">
                  <Input
                    type="number"
                    value={item.unit_price || 0}
                    min={0}
                    step="0.01"
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="text-center neo-blur"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Total */}
                <div className="w-32">
                  <Input
                    value={formatGNF(itemTotal)}
                    readOnly
                    className="text-center neo-blur bg-white/5"
                  />
                </div>
                
                {/* Remove Button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-black/40 rounded-lg p-8 text-center border border-white/10 neo-blur">
          <div className="max-w-md mx-auto">
            <div className="text-white/40 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-white/60 mb-4">Aucun produit dans ce bon de commande</p>
            <Button 
              onClick={() => setIsProductModalOpen(true)}
              variant="outline"
              className="neo-blur"
              disabled={productsLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier produit
            </Button>
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
        isLoading={productsLoading}
      />
    </div>
  );
}
