
import { CatalogProduct } from "@/types/catalog";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { ProductSelectionModal } from "./ProductSelectionModal";

interface ProductsSectionProps {
  orderItems: PurchaseOrderItem[];
  showProductModal: boolean;
  setShowProductModal: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: CatalogProduct[];
  addProductToOrder: (product: CatalogProduct) => void;
  removeProductFromOrder: (index: number) => void;
  updateProductQuantity: (index: number, quantity: number) => void;
  updateProductPrice: (index: number, price: number) => void;
  calculateTotal: () => number;
}

export const ProductsSection = ({
  orderItems,
  showProductModal,
  setShowProductModal,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  addProductToOrder,
  removeProductFromOrder,
  updateProductQuantity,
  updateProductPrice,
  calculateTotal
}: ProductsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Produits</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowProductModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter des produits
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Désignation</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Aucun produit ajouté à la commande
              </TableCell>
            </TableRow>
          ) : (
            orderItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{item.designation || "Produit sans nom"}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.unit_price}
                    min="0"
                    onChange={(e) => updateProductPrice(index, parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>{new Intl.NumberFormat('fr-FR').format(item.total_price)} GNF</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProductFromOrder(index)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
          {orderItems.length > 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">
                Total:
              </TableCell>
              <TableCell className="font-bold">
                {new Intl.NumberFormat('fr-FR').format(calculateTotal())} GNF
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ProductSelectionModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredProducts={filteredProducts}
        addProductToOrder={addProductToOrder}
      />
    </div>
  );
};
