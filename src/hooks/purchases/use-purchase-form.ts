
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { useToast } from "@/hooks/use-toast";
import { formatGNF } from "@/lib/currency";

export const usePurchaseForm = () => {
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

  return {
    // Loading states
    isLoading: isLoadingOrder || isLoadingProducts,
    
    // Form data
    id,
    suppliers,
    products,
    selectedSupplier,
    setSelectedSupplier,
    selectedProducts,
    setSelectedProducts,
    expectedDeliveryDate,
    setExpectedDeliveryDate,
    orderStatus,
    setOrderStatus,
    paymentStatus,
    setPaymentStatus,
    
    // Cost fields
    shippingCost,
    setShippingCost,
    transitCost,
    setTransitCost,
    logisticsCost,
    setLogisticsCost,
    discount,
    setDiscount,
    taxRate,
    setTaxRate,
    
    // Actions
    handleProductSelect,
    handleAddProduct,
    handleSubmit,
    navigate,
    
    // Calculations
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    formatGNF
  };
};
