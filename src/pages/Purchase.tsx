import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FileText, Plus, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatGNF } from "@/lib/currency";
import { OrderSummarySection } from "@/components/purchases/order-form/OrderSummarySection";

const Purchase = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentOrder, isLoadingOrder, handleUpdate, handleCreate } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { toast } = useToast();
  
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<PurchaseOrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [orderStatus, setOrderStatus] = useState<'draft' | 'pending' | 'delivered' | 'approved'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');

  useEffect(() => {
    if (id && currentOrder) {
      setSelectedSupplier(currentOrder.supplier_id);
      setSelectedProducts(currentOrder.items || []);
      setShippingCost(currentOrder.shipping_cost);
      setTransitCost(currentOrder.transit_cost);
      setLogisticsCost(currentOrder.logistics_cost);
      setDiscount(currentOrder.discount);
      setTaxRate(currentOrder.tax_rate);
      setExpectedDeliveryDate(currentOrder.expected_delivery_date || "");
      setOrderStatus(currentOrder.status as 'draft' | 'pending' | 'delivered' | 'approved');
      setPaymentStatus(currentOrder.payment_status);
    }
  }, [id, currentOrder]);

  const handleProductSelect = (index: number, productId: string) => {
    const selectedProduct = products?.find(p => p.id === productId);
    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Le produit sélectionné n'existe pas dans le catalogue",
        variant: "destructive"
      });
      return;
    }

    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product_id: productId,
      designation: selectedProduct.name,
      unit_price: selectedProduct.purchase_price || selectedProduct.price,
      total_price: (updatedProducts[index].quantity || 0) * (selectedProduct.purchase_price || selectedProduct.price)
    };
    setSelectedProducts(updatedProducts);
  };

  const calculateSubtotal = () => {
    const productsTotal = selectedProducts.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return productsTotal + shippingCost + transitCost + logisticsCost - discount;
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleAddProduct = () => {
    const newProduct: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      product_id: "",
      designation: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      selling_price: 0
    };
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fournisseur",
        variant: "destructive"
      });
      return;
    }

    const invalidProducts = selectedProducts.filter(
      item => !products?.some(p => p.id === item.product_id)
    );

    if (invalidProducts.length > 0) {
      toast({
        title: "Erreur",
        description: "Certains produits sélectionnés n'existent pas dans le catalogue",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderData = {
        supplier_id: selectedSupplier,
        items: selectedProducts.map(item => ({
          ...item,
          purchase_order_id: id
        })),
        shipping_cost: shippingCost,
        transit_cost: transitCost,
        logistics_cost: logisticsCost,
        discount: discount,
        tax_rate: taxRate,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_ttc: calculateTotal(),
        expected_delivery_date: expectedDeliveryDate,
        status: orderStatus,
        payment_status: paymentStatus
      };

      if (id) {
        await handleUpdate(id, orderData);
      } else {
        await handleCreate(orderData);
      }
      
      navigate("/purchase-orders");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  if (isLoadingOrder || isLoadingProducts) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {id ? "Modifier" : "Nouveau"} Bon de Commande
          </h1>
          <p className="text-gray-400">
            {id ? "Modifiez les détails du" : "Créez un nouveau"} bon de commande
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/purchase-orders")}
            className="neo-blur"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button variant="outline" className="neo-blur">
            <FileText className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
            Enregistrer
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-6 neo-blur border-white/10">
        <div className="space-y-2">
          <Label className="text-white/80">Fournisseur</Label>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="neo-blur">
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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">Date de livraison prévue</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                type="date"
                className="pl-10 neo-blur"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Statut de la commande</Label>
            <Select 
              value={orderStatus} 
              onValueChange={(value: 'draft' | 'pending' | 'delivered' | 'approved') => setOrderStatus(value)}
            >
              <SelectTrigger className="neo-blur">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Statut du paiement</Label>
            <Select 
              value={paymentStatus} 
              onValueChange={(value: 'pending' | 'partial' | 'paid') => setPaymentStatus(value)}
            >
              <SelectTrigger className="neo-blur">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="partial">Partiel</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
                    onChange={(e) => {
                      const updatedProducts = [...selectedProducts];
                      updatedProducts[index] = {
                        ...product,
                        quantity: Number(e.target.value),
                        total_price: Number(e.target.value) * product.unit_price
                      };
                      setSelectedProducts(updatedProducts);
                    }}
                    className="neo-blur"
                  />
                  <Input
                    type="number"
                    placeholder="Prix unitaire"
                    value={product.unit_price}
                    onChange={(e) => {
                      const updatedProducts = [...selectedProducts];
                      updatedProducts[index] = {
                        ...product,
                        unit_price: Number(e.target.value),
                        total_price: product.quantity * Number(e.target.value)
                      };
                      setSelectedProducts(updatedProducts);
                    }}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">Frais de livraison</Label>
            <Input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(Number(e.target.value))}
              className="neo-blur"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Transit & Douane</Label>
            <Input
              type="number"
              value={transitCost}
              onChange={(e) => setTransitCost(Number(e.target.value))}
              className="neo-blur"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Frais de logistique</Label>
            <Input
              type="number"
              value={logisticsCost}
              onChange={(e) => setLogisticsCost(Number(e.target.value))}
              className="neo-blur"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">Remise</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="neo-blur"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">TVA (%)</Label>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="neo-blur"
            />
          </div>
        </div>

        <OrderSummarySection 
          subtotal={calculateSubtotal()}
          tax={calculateTax()}
          total={calculateTotal()}
        />
      </Card>
    </div>
  );
};

export default Purchase;
