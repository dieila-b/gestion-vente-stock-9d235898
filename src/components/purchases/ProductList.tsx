
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { useProducts } from "@/hooks/use-products";
import { useState } from "react";

interface ProductListProps {
  selectedProducts: PurchaseOrderItem[];
  onProductChange: (items: PurchaseOrderItem[]) => void;
  onAddProduct: () => void;
}

export const ProductList = ({
  selectedProducts,
  onProductChange,
  onAddProduct,
}: ProductListProps) => {
  const { products } = useProducts();
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({});

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
      total_price: field === 'quantity' || field === 'unit_price' 
        ? (field === 'quantity' ? value : updatedProducts[index].quantity) * 
          (field === 'unit_price' ? value : updatedProducts[index].unit_price)
        : updatedProducts[index].total_price
    };
    onProductChange(updatedProducts);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>PU Achat</TableHead>
            <TableHead>PU Vente</TableHead>
            <TableHead>Montant TTC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedProducts.map((product, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={product.product_code || ""}
                  onChange={(e) =>
                    handleItemChange(index, "product_code", e.target.value)
                  }
                  className="w-full"
                  placeholder="Code"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={product.designation || ""}
                  onChange={(e) =>
                    handleItemChange(index, "designation", e.target.value)
                  }
                  className="w-full"
                  placeholder="Désignation"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                  className="w-full"
                  min="0"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.unit_price}
                  onChange={(e) =>
                    handleItemChange(index, "unit_price", Number(e.target.value))
                  }
                  className="w-full"
                  min="0"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.selling_price || 0}
                  onChange={(e) =>
                    handleItemChange(index, "selling_price", Number(e.target.value))
                  }
                  className="w-full"
                  min="0"
                />
              </TableCell>
              <TableCell>
                {product.total_price?.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={onAddProduct}
        >
          Ajouter un produit
        </Button>
      </div>
    </div>
  );
};
