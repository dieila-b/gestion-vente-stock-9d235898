
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogProduct } from "@/types/catalog";
import { X, Plus, Search } from "lucide-react";

interface InvoiceProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: CatalogProduct) => void;
  products: CatalogProduct[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const InvoiceProductModal = ({
  isOpen,
  onClose,
  onAddProduct,
  products,
  searchQuery,
  onSearchChange,
}: InvoiceProductModalProps) => {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' GNF';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background enhanced-glass rounded-lg p-6 w-full max-w-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sélectionner des produits</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10 enhanced-glass"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="grid gap-4 max-h-[400px] overflow-y-auto">
          {products.map(product => (
            <div
              key={product.id}
              className="enhanced-glass p-4 rounded-lg flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product.price)} - Ref: {product.reference}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onAddProduct(product)}
                className="enhanced-glass"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
