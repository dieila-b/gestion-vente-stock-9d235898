
import { Card } from "@/components/ui/card";
import { CatalogProduct } from "@/types/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: CatalogProduct;
  onEdit: (product: CatalogProduct) => void;
  onDelete: (product: CatalogProduct) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' GNF';
  };

  return (
    <Card className="p-4 enhanced-glass hover:scale-105 transition-transform">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gradient">{product.name}</h3>
        {product.reference && (
          <Badge variant="outline" className="bg-primary/10">
            {product.reference}
          </Badge>
        )}
      </div>
      {product.description && (
        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
      )}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Prix de vente:</span>
          <span className="font-bold text-gradient">{formatPrice(product.price)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Prix d'achat:</span>
          <span className="font-medium">{formatPrice(product.purchase_price)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={product.stock && product.stock > 0 ? "default" : "destructive"} className="text-xs">
            Stock: {product.stock || 0}
          </Badge>
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="enhanced-glass"
          onClick={() => onEdit(product)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="enhanced-glass"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
