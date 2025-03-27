
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { CatalogProduct } from "@/types/catalog";
import { formatGNF } from "@/lib/currency";

interface ProductsListProps {
  selectedProducts: PurchaseOrderItem[];
  products: CatalogProduct[] | undefined;
  handleProductSelect: (index: number, productId: string) => void;
  handleAddProduct: () => void;
  handleQuantityChange: (index: number, quantity: number) => void;
  handlePriceChange: (index: number, price: number) => void;
}

export const ProductsList = ({
  selectedProducts,
  products,
  handleProductSelect,
  handleAddProduct,
  handleQuantityChange,
  handlePriceChange
}: ProductsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-white/80">Produits</Label>
        <Button
          onClick={handleAddProduct}
          variant="outline"
          className="neo-blur"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <div className="space-y-4">
        {selectedProducts.map((product, index) => (
          <Card key={product.id} className="p-4 neo-blur border-white/10">
            <div className="grid grid-cols-4 gap-4">
              <Select
                value={product.product_id}
                onValueChange={(value) => handleProductSelect(index, value)}
              >
                <SelectTrigger className="neo-blur">
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Quantité"
                value={product.quantity}
                onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                className="neo-blur"
              />
              <Input
                type="number"
                placeholder="Prix unitaire"
                value={product.unit_price}
                onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                className="neo-blur"
              />
              <Input
                value={formatGNF(product.quantity * product.unit_price)}
                readOnly
                className="neo-blur bg-white/5"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
