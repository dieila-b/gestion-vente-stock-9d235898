
import { Input } from "@/components/ui/input";
import { CatalogProduct } from "@/types/catalog";

interface PricingDetailsSectionProps {
  product: Omit<CatalogProduct, 'id'>;
  onChange: (product: Omit<CatalogProduct, 'id'>) => void;
}

export const PricingDetailsSection = ({ product, onChange }: PricingDetailsSectionProps) => {
  const handlePriceChange = (value: string, field: 'price' | 'purchase_price') => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanValue;
    
    onChange({ 
      ...product, 
      [field]: formattedValue === '' ? 0 : parseFloat(formattedValue) 
    });
  };

  return (
    <>
      <div>
        <label className="text-sm text-muted-foreground">Prix de vente (GNF) *</label>
        <Input
          className="enhanced-glass mt-1"
          value={product.price}
          onChange={(e) => handlePriceChange(e.target.value, 'price')}
          inputMode="decimal"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Prix d'achat (GNF)</label>
        <Input
          className="enhanced-glass mt-1"
          value={product.purchase_price}
          onChange={(e) => handlePriceChange(e.target.value, 'purchase_price')}
          inputMode="decimal"
        />
      </div>
    </>
  );
};
