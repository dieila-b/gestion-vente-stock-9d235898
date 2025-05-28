
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

  // Calculate grand total
  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
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

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/80">Aucun produit ajouté</span>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-white/80">Produits ({items.length})</span>
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

      {/* Header row */}
      <div className="grid grid-cols-12 gap-4 p-3 text-sm text-white/60 font-medium bg-black/20 rounded-lg border border-white/5">
        <div className="col-span-4">Produit</div>
        <div className="col-span-2 text-center">Quantité</div>
        <div className="col-span-2 text-center">Prix unitaire</div>
        <div className="col-span-3 text-center">Total</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>
      
      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => {
          const itemTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
          const isLoading = loadingItems.has(item.id);
          
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
                  disabled={isLoading}
                />
              </div>
              
              <div className="col-span-2">
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

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
