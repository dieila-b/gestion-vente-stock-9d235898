
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { List, X } from "lucide-react";
import type { SupplierOrderProduct } from "@/types/supplierOrder";

interface OrderProductListProps {
  products: SupplierOrderProduct[];
  onAddProduct: (product: Partial<SupplierOrderProduct>) => void;
  onRemoveProduct: (productId: string) => void;
  onProductChange: (products: SupplierOrderProduct[]) => void;
  formatPrice: (price: number) => string;
}

export const OrderProductList = ({
  products,
  onAddProduct,
  onRemoveProduct,
  onProductChange,
  formatPrice,
}: OrderProductListProps) => {
  const handleQuantityChange = (productId: string, quantity: number) => {
    onProductChange(
      products.map((p) =>
        p.id === productId
          ? { ...p, quantity, totalPrice: p.unitPrice * quantity }
          : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-white/80">Produits</span>
        <Button
          type="button"
          variant="outline"
          className="neo-blur hover:bg-white/10"
          onClick={() => onAddProduct({ name: "Nouveau produit" })}
        >
          <List className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="neo-blur p-4 border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Nom du produit"
                value={product.name}
                onChange={(e) =>
                  onProductChange(
                    products.map((p) =>
                      p.id === product.id ? { ...p, name: e.target.value } : p
                    )
                  )
                }
                className="neo-blur"
              />
              <Input
                type="number"
                placeholder="Quantité"
                value={product.quantity}
                onChange={(e) =>
                  handleQuantityChange(product.id, Number(e.target.value))
                }
                className="neo-blur"
                min="1"
              />
              <Input
                type="number"
                placeholder="Prix unitaire"
                value={product.unitPrice}
                onChange={(e) =>
                  onProductChange(
                    products.map((p) =>
                      p.id === product.id
                        ? {
                            ...p,
                            unitPrice: Number(e.target.value),
                            totalPrice: Number(e.target.value) * p.quantity,
                          }
                        : p
                    )
                  )
                }
                className="neo-blur"
                min="0"
              />
              <div className="flex items-center gap-2">
                <Input
                  value={formatPrice(product.totalPrice)}
                  readOnly
                  className="neo-blur bg-white/5"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveProduct(product.id)}
                  className="hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
