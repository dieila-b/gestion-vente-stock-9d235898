import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ReturnItem } from '@/types/customer-return';

interface FormData {
  client_id: string;
  invoice_id: string;
  reason: string;
  notes: string;
  items: ReturnItem[];
}

export function useReturnDialog() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState<ReturnItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      client_id: '',
      invoice_id: '',
      reason: '',
      notes: '',
      items: [],
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, company_name')
          .order('company_name', { ascending: true });

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [toast]);

  const handleClientChange = async (clientId: string) => {
    try {
      form.setValue('client_id', clientId);
      
      // Clear previous invoice selection when client changes
      form.setValue('invoice_id', '');
      setInvoiceItems([]);
      setSelectedItems([]);
      
      // Fetch invoices for the selected client
      if (clientId) {
        const { data, error } = await supabase
          .from('orders')
          .select('id, invoice_number')
          .eq('client_id', clientId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setInvoices(data || []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error changing client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures pour ce client",
        variant: "destructive"
      });
    }
  };

  const handleInvoiceChange = async (invoiceId: string) => {
    try {
      form.setValue('invoice_id', invoiceId);
      
      // Clear previously selected items
      setSelectedItems([]);
      
      // Fetch invoice items for the selected invoice
      if (invoiceId) {
        const { data, error } = await supabase
          .from('order_items')
          .select('product_id, quantity, price, product_name')
          .eq('order_id', invoiceId);
          
        if (error) throw error;
        setInvoiceItems(data || []);
      } else {
        setInvoiceItems([]);
      }
    } catch (error) {
      console.error('Error changing invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles de cette facture",
        variant: "destructive"
      });
    }
  };

  const addItemToReturn = (item: ReturnItem) => {
    setSelectedItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.product_id === item.product_id);
      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        return [...prevItems, item];
      }
    });
  };

  const removeItemFromReturn = (productId: string) => {
    setSelectedItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const returnId = uuidv4();
      const formData = form.getValues();

      // Create customer return record
      const { error: returnError } = await supabase
        .from('customer_returns')
        .insert({
          id: returnId,
          return_number: `CR-${returnId.substring(0, 8).toUpperCase()}`,
          client_id: formData.client_id,
          invoice_id: formData.invoice_id,
          return_date: new Date().toISOString(),
          total_amount: selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: 'pending',
          reason: formData.reason,
          notes: formData.notes,
        });

      if (returnError) throw returnError;

      // Create customer return items records
      const returnItems = selectedItems.map(item => ({
        return_id: returnId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('customer_return_items')
        .insert(returnItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Succès",
        description: "Le retour client a été créé avec succès",
      });
      resetForm();
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le retour client",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setInvoices([]);
    setInvoiceItems([]);
    setSelectedItems([]);
  };

  return {
    form,
    clients,
    invoices,
    invoiceItems,
    selectedItems,
    isLoading,
    isSubmitting,
    handleClientChange,
    handleInvoiceChange,
    addItemToReturn,
    removeItemFromReturn,
    onSubmit,
    resetForm
  };
}
