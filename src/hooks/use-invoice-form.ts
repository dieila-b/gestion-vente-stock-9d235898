
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export function useInvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paidAmount, setPaidAmount] = useState(0);

  const form = useForm({
    defaultValues: {
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    },
  });

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const calculateTotalWithoutDiscount = () => {
    return calculateSubtotal();
  };

  const calculateTotal = () => {
    return calculateTotalWithoutDiscount();
  };

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.product_id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(prev => prev.map(p => {
        if (p.product_id === product.id) {
          return { ...p, quantity: p.quantity + 1 };
        }
        return p;
      }));
    } else {
      setSelectedProducts(prev => [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        discount: 0
      }]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setSelectedProducts(prev => prev.map(p => {
      if (p.product_id === productId) {
        return { ...p, quantity: Number(quantity) };
      }
      return p;
    }));
  };

  const updateProductPrice = (productId, price) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.product_id === productId) {
        return { ...p, price: Number(price) };
      }
      return p;
    }));
  };

  const handleSubmit = async (values) => {
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const invoiceId = uuidv4();
      const invoiceData = {
        id: invoiceId,
        client_id: selectedClient.id,
        issue_date: values.issue_date,
        due_date: values.due_date,
        total_amount: calculateTotal(),
        payment_status: paymentStatus,
        paid_amount: paidAmount,
        remaining_amount: calculateTotal() - paidAmount,
        status: "completed",
        notes: values.notes
      };

      // Insert invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData);

      if (invoiceError) throw invoiceError;

      // Insert invoice items with total calculated
      const invoiceItems = selectedProducts.map(product => ({
        invoice_id: invoiceId,
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
        discount: product.discount,
        total: product.price * product.quantity
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      // Record payment if paid
      if (paidAmount > 0) {
        const { error: paymentError } = await supabase
          .from('invoice_payments')
          .insert({
            invoice_id: invoiceId,
            amount: paidAmount,
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0]
          });

        if (paymentError) throw paymentError;
      }

      toast({
        title: "Success",
        description: "Invoice created successfully"
      });

      // Navigate to invoice details or list
      navigate('/invoices');
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Error creating invoice",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    selectedProducts,
    selectedClient,
    setSelectedClient,
    productSearchQuery,
    setProductSearchQuery,
    showProductsModal,
    setShowProductsModal,
    paymentStatus,
    setPaymentStatus,
    paidAmount,
    setPaidAmount,
    addProduct,
    removeProduct,
    updateProductQuantity,
    updateProductPrice,
    calculateSubtotal,
    calculateTotal,
    handleSubmit
  };
}
