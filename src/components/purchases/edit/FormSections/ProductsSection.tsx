
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
  
  // Fetch available products
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<CatalogProduct[]>({
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

  useEffect(() => {
    if (productsError) {
      console.error("Error loading products:", productsError);
    }
  }, [productsError]);
  
  useEffect(() => {
    console.log("Current items in ProductsSection:", items);
  }, [items]);

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

  // Handle quantity change
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

  // Handle price change
  const handlePriceChange = async (itemId: string, value: string) => {
    const price = parseInt(value);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white/70">Articles ({items?.length || 0})</h3>
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
        <div className="bg-black/40 rounded-md p-6 text-center border border-white/10 neo-blur">
          <p className="text-white/60">Aucun produit ajouté à ce bon de commande</p>
          <Button 
            onClick={() => setIsProductModalOpen(true)}
            variant="outline"
            className="mt-4 neo-blur"
            disabled={isLoading || productsLoading}
          >
            {isLoading || productsLoading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
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
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="text-center neo-blur"
                  disabled={isLoading && actionItemId === item.id}
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.unit_price}
                  min={0}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  className="text-center neo-blur"
                  disabled={isLoading && actionItemId === item.id}
                />
              </div>
              
              <div className="col-span-3 text-center font-medium">
                {formatGNF(item.quantity * item.unit_price)}
              </div>
              
              <div className="col-span-1 flex justify-end">
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
          ))}
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
