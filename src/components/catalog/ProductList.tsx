
import { CatalogProduct } from "@/types/catalog";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products: CatalogProduct[];
  searchQuery: string;
  onEdit: (product: CatalogProduct) => void;
  onDelete: (product: CatalogProduct) => void;
}

export const ProductList = ({ products = [], searchQuery, onEdit, onDelete }: ProductListProps) => {
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    const name = product?.name?.toLowerCase() || '';
    const reference = product?.reference?.toLowerCase() || '';
    
    return name.includes(search) || reference.includes(search);
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun produit trouvé
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

