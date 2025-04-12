
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePurchaseOrders } from '@/hooks/use-purchase-orders';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseOrder';
import { isSelectQueryError } from '@/utils/supabase-helpers';
import { safeSupplier, safeCast } from '@/utils/select-query-helper';

export function usePurchaseEdit(id: string) {
  const purchaseOrders = usePurchaseOrders();
  const { handleUpdate } = purchaseOrders;

  // Form state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<PurchaseOrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered" | "draft" | "approved">("pending");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [customItems, setCustomItems] = useState<PurchaseOrderItem[]>([]);

  // Fetch order data
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => purchaseOrders.fetchPurchaseOrder(id),
    onSuccess: (data) => {
      if (data) {
        // Process supplier data safely
        const supplier = safeSupplier(data.supplier);
        
        setSelectedSupplier(data.supplier_id || "");
        setShippingCost(data.shipping_cost || 0);
        setTransitCost(data.transit_cost || 0);
        setLogisticsCost(data.logistics_cost || 0);
        setDiscount(data.discount || 0);
        setTaxRate(data.tax_rate || 20);
        setExpectedDeliveryDate(data.expected_delivery_date ? new Date(data.expected_delivery_date).toISOString().split('T')[0] : "");
        setOrderStatus(data.status as "pending" | "delivered" | "draft" | "approved");
        setPaymentStatus(data.payment_status as "pending" | "partial" | "paid");
        
        if (Array.isArray(data.items) && data.items.length > 0) {
          setSelectedProducts(data.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            selling_price: item.selling_price,
            total_price: item.total_price,
            product: item.product ? safeCast(item.product, { name: "Unknown Product" }) : { name: "Unknown Product" },
            designation: item.product ? safeCast(item.product, { name: "Unknown Product" }).name : "Unknown Product"
          })));
        }
      }
    }
  });

  // Fetch products for selection
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data;
    }
  });

  // Fetch suppliers for selection
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data;
    }
  });

  // Product selection handler
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newProduct: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      product_id: product.id,
      quantity: 1,
      unit_price: product.purchase_price || 0,
      selling_price: product.price || 0,
      total_price: product.purchase_price || 0,
      product: product,
      designation: product.name
    };
    
    setSelectedProducts(prev => [...prev, newProduct]);
  };

  // Handler for adding a product
  const handleAddProduct = (product) => {
    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.product_id === product.id
    );

    if (existingProductIndex !== -1) {
      // If product already exists, update quantity
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += 1;
      updatedProducts[existingProductIndex].total_price =
        updatedProducts[existingProductIndex].quantity *
        updatedProducts[existingProductIndex].unit_price;
      setSelectedProducts(updatedProducts);
    } else {
      // Add new product
      const newProduct: PurchaseOrderItem = {
        id: `temp-${Date.now()}`,
        product_id: product.id,
        quantity: 1,
        unit_price: product.purchase_price || 0,
        selling_price: product.price || 0,
        total_price: product.purchase_price || 0,
        product: product,
        designation: product.name
      };
      
      setSelectedProducts([...selectedProducts, newProduct]);
    }
  };

  // Handler for updating quantity
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = newQuantity;
    updatedProducts[index].total_price = newQuantity * updatedProducts[index].unit_price;
    setSelectedProducts(updatedProducts);
  };

  // Handler for updating price
  const handlePriceChange = (index: number, newPrice: number) => {
    if (newPrice < 0) return;
    
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].unit_price = newPrice;
    updatedProducts[index].total_price = updatedProducts[index].quantity * newPrice;
    setSelectedProducts(updatedProducts);
  };

  // Calculate subtotal before taxes and additional costs
  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, product) => sum + product.total_price, 0);
  };

  // Calculate tax amount
  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  // Calculate total including taxes and additional costs
  const calculateTotal = () => {
    return (
      calculateSubtotal() +
      calculateTax() +
      shippingCost +
      transitCost +
      logisticsCost -
      discount
    );
  };

  // Form submission handler
  const handleSubmit = async () => {
    try {
      // Prepare order data
      const orderData = {
        supplier_id: selectedSupplier,
        expected_delivery_date: expectedDeliveryDate || null,
        shipping_cost: shippingCost,
        transit_cost: transitCost,
        logistics_cost: logisticsCost,
        discount: discount,
        tax_rate: taxRate,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_ttc: calculateTotal(),
        total_amount: calculateTotal(),
        status: orderStatus,
        payment_status: paymentStatus,
        items: selectedProducts
      };
      
      // Update the order
      const updatedOrder = await handleUpdate({ id, orderData });
      
      // Update items by removing old ones and adding new ones
      if (selectedProducts.length > 0) {
        // Remove existing items
        const { error: deleteError } = await supabase
          .from("purchase_order_items")
          .delete()
          .eq("purchase_order_id", id);
          
        if (deleteError) {
          console.error("Error deleting existing items:", deleteError);
          throw deleteError;
        }
        
        // Add new items
        const newItems = selectedProducts.map(item => ({
          purchase_order_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total_price: item.total_price
        }));
        
        const { error: insertError } = await supabase
          .from("purchase_order_items")
          .insert(newItems);
          
        if (insertError) {
          console.error("Error inserting new items:", insertError);
          throw insertError;
        }
      }
      
      // Success message
      toast.success("Bon de commande mis à jour avec succès");
      
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast.error("Erreur lors de la mise à jour du bon de commande");
    }
  };

  return {
    suppliers,
    products,
    isLoadingOrder,
    isLoadingProducts,
    selectedSupplier,
    setSelectedSupplier,
    selectedProducts,
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
    expectedDeliveryDate,
    setExpectedDeliveryDate,
    orderStatus,
    setOrderStatus,
    paymentStatus,
    setPaymentStatus,
    handleProductSelect,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    handleAddProduct,
    handleQuantityChange,
    handlePriceChange,
    handleSubmit
  };
}
