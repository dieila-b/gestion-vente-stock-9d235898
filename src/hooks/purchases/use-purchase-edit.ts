
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OrderStatus = "pending" | "delivered" | "draft" | "approved";
export type PaymentStatus = "pending" | "partial" | "paid";

export function usePurchaseEdit(id?: string) {
  // Define state variables
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

  // Fetch suppliers
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch purchase order if editing
  const { data: purchaseOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id(*),
          items:purchase_order_items(
            id,
            product_id,
            quantity,
            unit_price,
            selling_price,
            total_price,
            product:product_id(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Load purchase order data when available
  useEffect(() => {
    if (purchaseOrder) {
      setSelectedSupplier(purchaseOrder.supplier);
      setShippingCost(purchaseOrder.shipping_cost || 0);
      setTransitCost(purchaseOrder.transit_cost || 0);
      setLogisticsCost(purchaseOrder.logistics_cost || 0);
      setDiscount(purchaseOrder.discount || 0);
      setTaxRate(purchaseOrder.tax_rate || 20);
      setExpectedDeliveryDate(purchaseOrder.expected_delivery_date || "");
      
      // Safely cast the string to our specific type
      if (purchaseOrder.status) {
        const orderStatusValue = purchaseOrder.status as OrderStatus;
        setOrderStatus(orderStatusValue);
      }
      
      if (purchaseOrder.payment_status) {
        const paymentStatusValue = purchaseOrder.payment_status as PaymentStatus;
        setPaymentStatus(paymentStatusValue);
      }
      
      if (purchaseOrder.items && Array.isArray(purchaseOrder.items)) {
        setSelectedProducts(purchaseOrder.items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total_price: item.total_price
        })));
      }
    }
  }, [purchaseOrder]);

  // Function to handle status updates with proper type safety
  const handleOrderStatusChange = (status: OrderStatus) => {
    setOrderStatus(status);
  };

  const handlePaymentStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
  };

  // Product selection handler
  const handleProductSelect = (product: any) => {
    if (selectedProducts.some(p => p.product_id === product.id)) {
      toast.info("Ce produit est déjà dans la liste");
      return;
    }
    
    const newProduct = {
      product_id: product.id,
      product,
      quantity: 1,
      unit_price: product.purchase_price || 0,
      selling_price: product.price || 0,
      total_price: product.purchase_price || 0
    };
    
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  // Add product handler
  const handleAddProduct = () => {
    // Add an empty product entry to the list
    const newProduct = {
      product_id: "",
      product: null,
      quantity: 1,
      unit_price: 0,
      selling_price: 0,
      total_price: 0
    };
    
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  // Product selection after adding an empty product
  const handleProductSelectForIndex = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product_id: product.id,
      product,
      unit_price: product.purchase_price || 0,
      selling_price: product.price || 0,
      total_price: (updatedProducts[index].quantity || 1) * (product.purchase_price || 0)
    };
    
    setSelectedProducts(updatedProducts);
  };

  // Quantity change handler
  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          quantity,
          total_price: quantity * item.unit_price
        };
      }
      return item;
    }));
  };

  // Alternative quantity change handler that works with index
  const handleQuantityChangeByIndex = (index: number, quantity: number) => {
    const updatedProducts = [...selectedProducts];
    if (updatedProducts[index]) {
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity,
        total_price: quantity * updatedProducts[index].unit_price
      };
      setSelectedProducts(updatedProducts);
    }
  };

  // Price change handler
  const handlePriceChange = (productId: string, price: number) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          unit_price: price,
          total_price: item.quantity * price
        };
      }
      return item;
    }));
  };

  // Alternative price change handler that works with index
  const handlePriceChangeByIndex = (index: number, price: number) => {
    const updatedProducts = [...selectedProducts];
    if (updatedProducts[index]) {
      updatedProducts[index] = {
        ...updatedProducts[index],
        unit_price: price,
        total_price: updatedProducts[index].quantity * price
      };
      setSelectedProducts(updatedProducts);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  // Calculate tax
  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + shippingCost + transitCost + logisticsCost - discount;
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      if (!selectedSupplier) {
        toast.error("Veuillez sélectionner un fournisseur");
        return;
      }

      const orderData = {
        supplier_id: selectedSupplier.id,
        status: orderStatus,
        payment_status: paymentStatus,
        shipping_cost: shippingCost,
        transit_cost: transitCost,
        logistics_cost: logisticsCost,
        discount,
        tax_rate: taxRate,
        expected_delivery_date: expectedDeliveryDate || null,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_amount: calculateTotal()
      };

      let result;
      
      if (id) {
        // Update existing order
        const { data, error } = await supabase
          .from('purchase_orders')
          .update(orderData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        // Handle order items updates
        // This would typically include deleting removed items and updating existing ones
      } else {
        // Create new order
        const { data, error } = await supabase
          .from('purchase_orders')
          .insert(orderData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        // Insert order items
        if (selectedProducts.length > 0) {
          const items = selectedProducts.map(product => ({
            purchase_order_id: result.id,
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price,
            selling_price: product.selling_price,
            total_price: product.total_price
          }));
          
          const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(items);
          
          if (itemsError) throw itemsError;
        }
      }
      
      toast.success(`Commande ${id ? 'mise à jour' : 'créée'} avec succès`);
      return result;
    } catch (error: any) {
      console.error("Error saving purchase order:", error);
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  return {
    suppliers,
    products,
    isLoadingOrder,
    isLoadingProducts: isLoadingProducts || isLoadingSuppliers,
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
    setOrderStatus: handleOrderStatusChange,
    paymentStatus,
    setPaymentStatus: handlePaymentStatusChange,
    handleProductSelect,
    handleProductSelectForIndex,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    handleAddProduct,
    handleQuantityChange,
    handleQuantityChangeByIndex,
    handlePriceChange,
    handlePriceChangeByIndex,
    handleSubmit
  };
}
