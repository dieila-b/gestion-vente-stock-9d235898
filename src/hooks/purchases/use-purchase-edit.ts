
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseOrder';
import { toast } from 'sonner';

export function usePurchaseEdit(id?: string) {
  // State for selected products and other form data
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered" | "draft" | "approved">("pending");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [selectedProducts, setSelectedProducts] = useState<PurchaseOrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch purchase order if id is provided
  const { data: currentOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(*, product:catalog(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PurchaseOrder;
    },
    enabled: !!id
  });

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');

      if (error) {
        console.error('Error fetching suppliers:', error);
        return;
      }

      setSuppliers(data || []);
    };

    fetchSuppliers();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    };

    fetchProducts();
  }, []);

  // Populate form data if editing existing purchase order
  useEffect(() => {
    if (currentOrder) {
      setSelectedSupplier(currentOrder.supplier_id);
      setExpectedDeliveryDate(currentOrder.expected_delivery_date || '');
      setOrderStatus(currentOrder.status || 'pending');
      setPaymentStatus(currentOrder.payment_status || 'pending');
      setShippingCost(currentOrder.shipping_cost || 0);
      setTransitCost(currentOrder.transit_cost || 0);
      setLogisticsCost(currentOrder.logistics_cost || 0);
      setDiscount(currentOrder.discount || 0);
      setTaxRate(currentOrder.tax_rate || 20);
      
      // Set selected products
      if (Array.isArray(currentOrder.items)) {
        setSelectedProducts(currentOrder.items.map(item => ({
          id: item.id,
          purchase_order_id: item.purchase_order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price || 0,
          total_price: item.total_price,
          product: item.product
        })));
      }
    }
  }, [currentOrder]);

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedProducts(prev => [
      ...prev,
      {
        id: '', // Will be assigned by the database
        purchase_order_id: id || '',
        product_id: product.id,
        quantity: 1,
        unit_price: product.purchase_price || 0,
        selling_price: product.price || 0,
        total_price: product.purchase_price || 0,
        product
      }
    ]);
  };

  // Handle adding a product
  const handleAddProduct = (productId: string) => {
    handleProductSelect(productId);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    setSelectedProducts(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      updated[index].total_price = quantity * updated[index].unit_price;
      return updated;
    });
  };

  // Handle price change
  const handlePriceChange = (index: number, price: number) => {
    setSelectedProducts(prev => {
      const updated = [...prev];
      updated[index].unit_price = price;
      updated[index].total_price = updated[index].quantity * price;
      return updated;
    });
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, item) => total + item.total_price, 0);
  };

  // Calculate tax
  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + shippingCost + logisticsCost + transitCost - discount;
  };

  // Update purchase order mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string, orderData: Partial<PurchaseOrder> }) => {
      const { id, orderData } = data;
      const { error } = await supabase
        .from('purchase_orders')
        .update(orderData)
        .eq('id', id);

      if (error) throw error;

      return { ...orderData, id };
    }
  });

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedSupplier) {
      toast.error('Veuillez sélectionner un fournisseur');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
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
        await updateMutation.mutateAsync({ id, orderData });

        // Update or add items
        for (const item of selectedProducts) {
          if (item.id) {
            // Update existing item
            await supabase
              .from('purchase_order_items')
              .update({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                selling_price: item.selling_price,
                total_price: item.total_price
              })
              .eq('id', item.id);
          } else {
            // Add new item
            await supabase
              .from('purchase_order_items')
              .insert({
                purchase_order_id: id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                selling_price: item.selling_price,
                total_price: item.total_price
              });
          }
        }

        toast.success('Bon de commande mis à jour avec succès');
      }
    } catch (error) {
      console.error('Error submitting purchase order:', error);
      toast.error('Erreur lors de la soumission du bon de commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    suppliers,
    products,
    isLoadingOrder,
    isLoadingProducts: products.length === 0,
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
    handleSubmit,
    isSubmitting
  };
}
