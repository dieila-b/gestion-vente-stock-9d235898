
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { SupplierOrderProduct } from "@/types/supplierOrder";

interface ProductListFormProps {
  products: Partial<SupplierOrderProduct>[];
  onAddProduct: () => void;
  onUpdateProduct: (index: number, field: string, value: string | number) => void;
  onRemoveProduct: (index: number) => void;
  isPriceRequest?: boolean;
}

export const ProductListForm = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  isPriceRequest = false,
}: ProductListFormProps) => {
  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-white/10 rounded-lg"
        >
          <div>
            <Label>Nom du produit</Label>
            <Input
              value={product.name}
              onChange={(e) => onUpdateProduct(index, "name", e.target.value)}
              placeholder="Nom du produit"
              className="neo-blur"
              required
            />
          </div>
          <div>
            <Label>Quantité</Label>
            <Input
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) =>
                onUpdateProduct(index, "quantity", parseInt(e.target.value))
              }
              className="neo-blur"
              required
            />
          </div>
          <div>
            <Label>Référence</Label>
            <Input
              value={product.reference}
              onChange={(e) =>
                onUpdateProduct(index, "reference", e.target.value)
              }
              placeholder="Référence optionnelle"
              className="neo-blur"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onRemoveProduct(index)}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={onAddProduct}
        className="w-full neo-blur"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un produit
      </Button>
    </div>
  );
};
