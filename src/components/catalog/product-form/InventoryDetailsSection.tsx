
import { Input } from "@/components/ui/input";
import { CatalogProduct } from "@/types/catalog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductUnit } from "@/types/catalog";

interface InventoryDetailsSectionProps {
  product: Omit<CatalogProduct, 'id'>;
  units: ProductUnit[];
  categories: string[];
  onChange: (product: Omit<CatalogProduct, 'id'>) => void;
}

export const InventoryDetailsSection = ({ 
  product, 
  units, 
  categories, 
  onChange 
}: InventoryDetailsSectionProps) => {
  
  const handleStockChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    onChange({ 
      ...product, 
      stock: cleanValue === '' ? 0 : parseInt(cleanValue, 10)
    });
  };

  return (
    <>
      <div>
        <label className="text-sm text-muted-foreground">Référence</label>
        <Input
          className="enhanced-glass mt-1"
          value={product.reference}
          readOnly
          disabled
        />
      </div>
      
      <div>
        <label className="text-sm text-muted-foreground">Catégorie</label>
        <Select
          value={product.category}
          onValueChange={(value) => onChange({ ...product, category: value })}
        >
          <SelectTrigger className="enhanced-glass mt-1">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="new">
                + Nouvelle catégorie
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {product.category === "new" && (
          <Input
            className="enhanced-glass mt-2"
            placeholder="Entrez une nouvelle catégorie"
            onChange={(e) => onChange({ ...product, category: e.target.value })}
            value={product.category === "new" ? "" : product.category}
          />
        )}
      </div>
      
      <div>
        <label className="text-sm text-muted-foreground">Stock</label>
        <Input
          className="enhanced-glass mt-1"
          value={product.stock}
          onChange={(e) => handleStockChange(e.target.value)}
          inputMode="numeric"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Unité</label>
        <Select
          value={product.unit_id}
          onValueChange={(value) => onChange({ ...product, unit_id: value })}
        >
          <SelectTrigger className="enhanced-glass mt-1">
            <SelectValue placeholder="Sélectionner une unité" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
