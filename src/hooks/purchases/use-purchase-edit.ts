
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePurchaseOrders } from '@/hooks/use-purchase-orders';
import { PurchaseOrderItem } from '@/types/purchaseOrder';
import { isSelectQueryError } from '@/utils/supabase-helpers';

export function usePurchaseEdit(id?: string) {
  // Get necessary purchase order functions
  const {
    handleCreate,
    handleUpdate,
    fetchPurchaseOrder,
    isLoading
  } = usePurchaseOrders();

  // Local state for form fields
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [orderStatus, setOrderStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const [shippingCost, setShippingCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [selectedProducts, setSelectedProducts] = useState<PurchaseOrderItem[]>([]);

  // Fetch suppliers and products
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch purchase order data if ID is provided (editing mode)
  const { data: orderData } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => fetchPurchaseOrder(id || ''),
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        setSelectedSupplier(data.supplier_id || '');
        setExpectedDeliveryDate(data.expected_delivery_date || '');
        setOrderStatus(data.status as 'pending' | 'delivered');
        setPaymentStatus(data.payment_status as 'pending' | 'partial' | 'paid');
        setShippingCost(data.shipping_cost || 0);
        setTransitCost(data.transit_cost || 0);
        setLogisticsCost(data.logistics_cost || 0);
        setDiscount(data.discount || 0);
        setTaxRate(data.tax_rate || 20);
        
        if (Array.isArray(data.items)) {
          setSelectedProducts(data.items.map(item => ({
            ...item,
            // Ensure all required fields have values
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            selling_price: item.selling_price || 0,
            total_price: item.total_price || 0
          })));
        }
      }
    }
  });

  // Product handling functions
  const handleProductSelect = (productId: string) => {
    if (products) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProducts(prev => [
          ...prev,
          {
            product_id: product.id,
            quantity: 1,
            unit_price: product.purchase_price || 0,
            selling_price: product.price || 0,
            total_price: product.purchase_price || 0,
            product
          }
        ]);
      }
    }
  };

  const handleAddProduct = (productId: string) => {
    handleProductSelect(productId);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setSelectedProducts(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          quantity,
          total_price: quantity * item.unit_price
        };
      }
      return item;
    }));
  };

  const handlePriceChange = (index: number, price: number) => {
    setSelectedProducts(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          unit_price: price,
          total_price: item.quantity * price
        };
      }
      return item;
    }));
  };

  // Calculation functions
  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + shippingCost + transitCost + logisticsCost - discount;
  };

  // Form submission
  const handleSubmit = async () => {
    const purchaseOrderData = {
      supplier_id: selectedSupplier,
      expected_delivery_date: expectedDeliveryDate,
      status: orderStatus,
      payment_status: paymentStatus,
      shipping_cost: shippingCost,
      transit_cost: transitCost,
      logistics_cost: logisticsCost,
      discount: discount,
      tax_rate: taxRate,
      subtotal: calculateSubtotal(),
      tax_amount: calculateTax(),
      total_ttc: calculateTotal(),
      total_amount: calculateTotal()
    };

    if (id) {
      // Update existing purchase order
      const updatedData = await handleUpdate.mutateAsync({
        id,
        ...purchaseOrderData
      });

      // Handle items separately if needed
      // ...

      return updatedData;
    } else {
      // Create new purchase order
      const newOrder = await handleCreate.mutateAsync(purchaseOrderData);

      // Handle items
      if (selectedProducts.length > 0 && newOrder?.id) {
        const itemsToInsert = selectedProducts.map(item => ({
          purchase_order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total_price: item.total_price
        }));

        // Insert items
        const { error } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (error) {
          console.error('Error adding items:', error);
        }
      }

      return newOrder;
    }
  };

  return {
    suppliers,
    products,
    isLoading: isLoading || isLoadingSuppliers || isLoadingProducts,
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
