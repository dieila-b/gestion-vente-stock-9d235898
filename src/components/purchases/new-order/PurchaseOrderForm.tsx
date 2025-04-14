
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Package, Plus, Calendar, DollarSign } from "lucide-react";
import { useSuppliers } from "@/hooks/use-suppliers";
import { usePurchaseOrderFormState } from "./usePurchaseOrderFormState";
import { usePurchaseOrderSubmit } from "./usePurchaseOrderSubmit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { ProductSelectionModal } from "./ProductSelectionModal";

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const [showProductModal, setShowProductModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state from custom hook
  const { 
    supplier, setSupplier,
    orderNumber, setOrderNumber,
    deliveryDate, setDeliveryDate,
    notes, setNotes,
    taxRate, setTaxRate,
    logisticsCost, setLogisticsCost,
    transitCost, setTransitCost,
    discount, setDiscount,
    shippingCost, setShippingCost,
    orderStatus, setOrderStatus,
    paymentStatus, setPaymentStatus,
    paidAmount, setPaidAmount,
    orderItems, setOrderItems
  } = usePurchaseOrderFormState();
  
  // Form submission handling with custom hook
  const { 
    handleSubmit,
    calculateSubtotal,
    calculateTax,
    calculateTotalTTC,
    calculateRemainingAmount,
    formatPrice 
  } = usePurchaseOrderSubmit({
    supplier,
    orderNumber,
    deliveryDate,
    notes,
    orderStatus,
    paymentStatus,
    paidAmount,
    logisticsCost,
    transitCost,
    taxRate,
    shippingCost,
    discount,
    orderItems,
    setIsSubmitting,
    toast,
    navigate
  });

  // Calculate total values
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotalTTC();
  const remainingAmount = calculateRemainingAmount();

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-black/20 text-white">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-gradient flex items-center gap-2">
              <Package className="h-6 w-6" />
              Nouvelle Commande Fournisseur
            </CardTitle>
            <p className="text-white/60">Créez une nouvelle commande pour Ender</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Supplier and delivery date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/80">Fournisseur</Label>
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger className="neo-blur border-white/10">
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Date de livraison prévue</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    type="date"
                    className="pl-10 neo-blur border-white/10"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payment and order status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-white/80">Statut du paiement</Label>
                <RadioGroup
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as "pending" | "partial" | "paid")}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="pending"
                      id="pending"
                      className="border-white/20 text-purple-500"
                    />
                    <Label htmlFor="pending" className="text-white/60">En attente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="partial"
                      id="partial"
                      className="border-white/20 text-blue-500"
                    />
                    <Label htmlFor="partial" className="text-white/60">Partiel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="paid"
                      id="paid"
                      className="border-white/20 text-green-500"
                    />
                    <Label htmlFor="paid" className="text-white/60">Payé</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-4">
                <Label className="text-white/80">Statut de la commande</Label>
                <RadioGroup
                  value={orderStatus}
                  onValueChange={(value) => setOrderStatus(value as "pending" | "delivered")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="pending"
                      id="order-pending"
                      className="border-white/20 text-purple-500"
                    />
                    <Label htmlFor="order-pending" className="text-white/60">En attente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="delivered"
                      id="delivered"
                      className="border-white/20 text-green-500"
                    />
                    <Label htmlFor="delivered" className="text-white/60">Livrée</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-white/80">Produits</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="neo-blur hover:bg-white/10"
                  onClick={() => setShowProductModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
              
              {/* Product list would go here */}
              <div className="min-h-[50px] p-4 border border-dashed border-white/20 rounded-md">
                {orderItems.length === 0 ? (
                  <p className="text-white/40 text-center">Aucun produit ajouté</p>
                ) : (
                  <div className="space-y-4">
                    {/* Product items would render here */}
                  </div>
                )}
              </div>
            </div>

            {/* Additional costs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white/80">Coûts additionnels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Remise</Label>
                  <FormattedNumberInput
                    value={discount}
                    onChange={setDiscount}
                    min={0}
                    className="neo-blur border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Frais de livraison</Label>
                  <FormattedNumberInput
                    value={shippingCost}
                    onChange={setShippingCost}
                    min={0}
                    className="neo-blur border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Frais de logistique</Label>
                  <FormattedNumberInput
                    value={logisticsCost}
                    onChange={setLogisticsCost}
                    min={0}
                    className="neo-blur border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Transit & Douane</Label>
                  <FormattedNumberInput
                    value={transitCost}
                    onChange={setTransitCost}
                    min={0}
                    className="neo-blur border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Taux de TVA (%)</Label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="neo-blur border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Sous-total</Label>
                  <Input
                    value={formatPrice(subtotal)}
                    readOnly
                    className="bg-white/5 border-white/10 text-white/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">TVA</Label>
                  <Input
                    value={formatPrice(tax)}
                    readOnly
                    className="bg-white/5 border-white/10 text-white/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Total TTC</Label>
                <Input
                  value={formatPrice(total)}
                  readOnly
                  className="bg-white/5 border-white/10 text-white/80 text-lg font-bold"
                />
              </div>
            </div>

            {/* Payment counter */}
            <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compteur de Paiements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Montant payé</Label>
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="neo-blur border-white/10"
                    min="0"
                    max={total}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white/80">Montant total</Label>
                  <Input
                    value={formatPrice(total)}
                    readOnly
                    className="neo-blur bg-white/5 border-white/10 text-white/80"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white/80">Montant restant</Label>
                  <Input
                    value={formatPrice(remainingAmount)}
                    readOnly
                    className="neo-blur bg-white/5 border-white/10 text-white/80"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-white/80">Notes et spécifications</Label>
              <Textarea
                placeholder="Ajoutez des détails sur les produits demandés..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] neo-blur border-white/10"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="neo-blur border-white/10 text-white/80"
                onClick={() => navigate("/purchase-orders")}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="neo-blur"
                disabled={isSubmitting || !supplier}
              >
                {isSubmitting ? "Création en cours..." : "Créer la commande"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Product selection modal */}
      {showProductModal && (
        <ProductSelectionModal
          open={showProductModal}
          onClose={() => setShowProductModal(false)}
          onAddProduct={(product) => {
            // Logic to add product to order items
            setShowProductModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PurchaseOrderForm;
