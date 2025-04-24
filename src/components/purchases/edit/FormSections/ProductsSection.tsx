
import { useState } from "react";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { CatalogProduct } from "@/types/catalog";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { ProductsHeader } from "./products/ProductsHeader";
import { EmptyState } from "./products/EmptyState";
import { ProductItem } from "./products/ProductItem";

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
  const [isLoading, setIsLoading] = useState(false);
  const [actionItemId, setActionItemId] = useState<string | null>(null);
  
  // Handle product addition
  const handleAddProduct = async (product: CatalogProduct) => {
    setIsLoading(true);
    try {
      const success = await addItem(product);
      if (success) {
        setIsProductModalOpen(false);
      }
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
      <ProductsHeader 
        itemCount={items?.length || 0}
        onAddProduct={() => setIsProductModalOpen(true)}
        isLoading={isLoading}
      />

      {!items || items.length === 0 ? (
        <EmptyState 
          onAddProduct={() => setIsProductModalOpen(true)}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ProductItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onPriceChange={handlePriceChange}
              onRemove={handleRemoveItem}
              isLoading={isLoading}
              actionItemId={actionItemId}
            />
          ))}
        </div>
      )}

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleAddProduct}
        isLoading={isLoading}
      />
    </div>
  );
}
