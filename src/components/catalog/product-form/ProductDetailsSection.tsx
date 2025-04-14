
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CatalogProduct } from "@/types/catalog";

interface ProductDetailsSectionProps {
  product: Omit<CatalogProduct, 'id'>;
  onChange: (product: Omit<CatalogProduct, 'id'>) => void;
}

export const ProductDetailsSection = ({ product, onChange }: ProductDetailsSectionProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Omit<CatalogProduct, 'id'>
  ) => {
    onChange({ ...product, [field]: e.target.value });
  };

  return (
    <div className="space-y-4 md:col-span-2">
      <div>
        <label className="text-sm text-muted-foreground">Nom du produit *</label>
        <Input
          className="enhanced-glass mt-1"
          value={product.name}
          onChange={(e) => handleChange(e, 'name')}
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Description</label>
        <Textarea
          className="enhanced-glass mt-1 min-h-[100px]"
          value={product.description}
          onChange={(e) => handleChange(e, 'description')}
        />
      </div>
    </div>
  );
};
