
import { CatalogProduct } from "@/types/catalog";
import { CategoryGroup } from "./CategoryGroup";

interface ProductSectionProps {
  products: CatalogProduct[];
  searchQuery: string;
  onEdit: (product: CatalogProduct) => void;
  onDelete: (product: CatalogProduct) => void;
}

export function ProductSection({ products, searchQuery, onEdit, onDelete }: ProductSectionProps) {
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    const name = product?.name?.toLowerCase() || '';
    const reference = product?.reference?.toLowerCase() || '';
    
    return name.includes(search) || reference.includes(search);
  });

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Sans catégorie';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, CatalogProduct[]>);

  return (
    <div className="px-4 space-y-6">
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <CategoryGroup
          key={category}
          category={category}
          products={categoryProducts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

