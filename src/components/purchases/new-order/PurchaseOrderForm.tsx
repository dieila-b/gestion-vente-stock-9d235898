
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { CatalogDebugInfo } from "./CatalogDebugInfo";
import { useProductSelection } from "@/hooks/use-product-selection";
import { usePurchaseOrderSubmit } from "./usePurchaseOrderSubmit";
import { formatGNF } from "@/lib/currency";

export default function PurchaseOrderForm() {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const {
    orderItems,
    showProductModal,
    setShowProductModal,
    addProductToOrder,
    removeProductFromOrder,
    updateProductQuantity,
    updateProductPrice,
    calculateTotal
  } = useProductSelection();

  const { submitPurchaseOrder, isSubmitting } = usePurchaseOrderSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier) {
      alert("Veuillez sélectionner un fournisseur");
      return;
    }

    if (orderItems.length === 0) {
      alert("Veuillez ajouter au moins un produit");
      return;
    }

    const orderData = {
      supplier_id: selectedSupplier,
      expected_delivery_date: expectedDeliveryDate || null,
      notes,
      items: orderItems,
      total_amount: calculateTotal()
    };

    await submitPurchaseOrder(orderData);
  };

  return (
    <div className="space-y-6">
      <CatalogDebugInfo />
      
      <Card className="neo-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Nouveau Bon de Commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Fournisseur</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="neo-blur">
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier-1">Fournisseur Test 1</SelectItem>
                    <SelectItem value="supplier-2">Fournisseur Test 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white/80">Date de livraison attendue</Label>
                <Input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="neo-blur"
                />
              </div>
            </div>

            {/* Section Produits */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-white/80">Produits</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductModal(true)}
                  className="neo-blur"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter des produits
                </Button>
              </div>

              {/* Liste des produits */}
              {orderItems.length === 0 ? (
                <Card className="p-4 neo-blur border-white/10">
                  <p className="text-white/60 text-center">
                    Aucun produit ajouté. Cliquez sur "Ajouter des produits" pour commencer.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <Card key={item.id} className="p-4 neo-blur border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-medium text-white">
                            {item.product?.name || "Produit sans nom"}
                          </p>
                          <p className="text-sm text-white/60">
                            Ref: {item.product?.reference || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-white/60">Quantité</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                            className="neo-blur"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white/60">Prix unitaire</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateProductPrice(index, parseFloat(e.target.value) || 0)}
                            className="neo-blur"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white/60">Total</Label>
                          <p className="text-white font-medium">
                            {formatGNF(item.total_price)}
                          </p>
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProductFromOrder(index)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {/* Total */}
                  <Card className="p-4 neo-blur border-white/10 bg-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-white">Total:</span>
                      <span className="text-xl font-bold text-white">
                        {formatGNF(calculateTotal())}
                      </span>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label className="text-white/80">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes optionnelles..."
                className="neo-blur"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || orderItems.length === 0}
                className="bg-white/10 hover:bg-white/20"
              >
                {isSubmitting ? "Création..." : "Créer le bon de commande"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="neo-blur"
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ProductSelectionModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddProduct={addProductToOrder}
      />
    </div>
  );
}
