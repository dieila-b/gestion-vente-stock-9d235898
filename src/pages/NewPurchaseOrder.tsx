
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { OrderInfoForm } from "@/components/purchases/order-form/OrderInfoForm";
import { ProductsSection } from "@/components/purchases/order-form/ProductsSection";
import { NotesSection } from "@/components/purchases/order-form/NotesSection";
import { useProductSelection } from "@/hooks/use-product-selection";
import { supabase } from "@/integrations/supabase/client";
import { OrderPriceSection } from "@/components/suppliers/order-form/OrderPriceSection";
import { OrderSummarySection } from "@/components/purchases/order-form/OrderSummarySection";

const NewPurchaseOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleCreate } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [supplier, setSupplier] = useState("");
  const [orderNumber, setOrderNumber] = useState(`BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Nouveaux champs pour coûts additionnels
  const [taxRate, setTaxRate] = useState(20);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Products management with custom hook
  const {
    orderItems,
    setOrderItems,
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
  } = useProductSelection();

  // Calculs des montants
  const calculateSubtotal = () => {
    return calculateTotal();
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotalTTC = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax + shippingCost + logisticsCost + transitCost - discount;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fournisseur",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Créer le bon de commande principal
      const purchaseOrderData = {
        supplier_id: supplier,
        order_number: orderNumber,
        expected_delivery_date: deliveryDate,
        warehouse_id: warehouseId || undefined,
        notes,
        status: 'draft' as 'draft' | 'pending' | 'delivered' | 'approved',
        total_amount: calculateTotal(),
        payment_status: 'pending' as 'pending' | 'partial' | 'paid',
        logistics_cost: logisticsCost,
        transit_cost: transitCost,
        tax_rate: taxRate,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_ttc: calculateTotalTTC(),
        shipping_cost: shippingCost,
        discount: discount
      };
      
      // Créer le bon de commande sans les items pour éviter l'erreur
      const createdOrder = await handleCreate(purchaseOrderData);
      
      // Si des items existent, les ajouter séparément
      if (orderItems.length > 0) {
        // Préparer les items pour l'insertion en base de données
        const itemsToInsert = orderItems.map(item => ({
          purchase_order_id: createdOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total_price: item.total_price
        }));

        // Insérer les items
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) {
          throw itemsError;
        }
      }
      
      toast({
        title: "Succès",
        description: "Bon de commande créé avec succès",
      });
      
      navigate("/purchase-orders");
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du bon de commande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nouveau bon de commande</h1>
        <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
          Retour
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations du bon de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <OrderInfoForm 
              orderNumber={orderNumber}
              setOrderNumber={setOrderNumber}
              supplier={supplier}
              setSupplier={setSupplier}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              warehouseId={warehouseId}
              setWarehouseId={setWarehouseId}
            />
            
            <ProductsSection 
              orderItems={orderItems}
              showProductModal={showProductModal}
              setShowProductModal={setShowProductModal}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredProducts={filteredProducts}
              addProductToOrder={addProductToOrder}
              removeProductFromOrder={removeProductFromOrder}
              updateProductQuantity={updateProductQuantity}
              updateProductPrice={updateProductPrice}
              calculateTotal={calculateTotal}
            />
            
            <OrderPriceSection
              discount={discount}
              shippingCost={shippingCost}
              logisticsCost={logisticsCost}
              transitCost={transitCost}
              taxRate={taxRate}
              onDiscountChange={setDiscount}
              onShippingCostChange={setShippingCost}
              onLogisticsCostChange={setLogisticsCost}
              onTransitCostChange={setTransitCost}
              onTaxRateChange={setTaxRate}
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotalTTC()}
              formatPrice={formatPrice}
            />
            
            {/* Nouvelle section résumé des montants */}
            <OrderSummarySection 
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotalTTC()}
            />
            
            <NotesSection 
              notes={notes}
              setNotes={setNotes}
            />
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/purchase-orders")}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !supplier}
              >
                {isSubmitting ? "Création en cours..." : "Créer le bon de commande"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPurchaseOrder;
