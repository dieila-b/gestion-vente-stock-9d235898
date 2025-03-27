
import { CatalogProduct } from "@/types/catalog";
import { CatalogProductTable } from "./CatalogProductTable";

interface CategoryGroupProps {
  category: string;
  products: CatalogProduct[];
  onEdit: (product: CatalogProduct) => void;
  onDelete: (product: CatalogProduct) => void;
}

export function CategoryGroup({ category, products, onEdit, onDelete }: CategoryGroupProps) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden enhanced-glass">
      <div className="bg-white/5 px-4 py-2 border-b border-white/10">
        <h2 className="text-lg font-semibold text-gradient">{category}</h2>
      </div>
      <CatalogProductTable 
        products={products}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

