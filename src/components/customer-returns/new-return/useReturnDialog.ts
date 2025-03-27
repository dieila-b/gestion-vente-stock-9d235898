
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NewReturnForm, InvoiceItem } from "@/types/customer-return";

export function useReturnDialog(onSuccess: () => void, onClose: () => void) {
  const [clients, setClients] = useState<{id: string, company_name: string}[]>([]);
  const [invoices, setInvoices] = useState<{id: string, invoice_number: string, client_id: string}[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<{id: string, invoice_number: string}[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [products, setProducts] = useState<{id: string, name: string}[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [newReturn, setNewReturn] = useState<NewReturnForm>({
    client_id: "",
    invoice_id: "",
    reason: "",
    notes: "",
    items: []
  });
  const { toast } = useToast();

  // Fetch invoices data
  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices...');
      const { data, error } = await supabase
        .from('orders')
        .select('id, client_id')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const transformedData = data.map(order => ({
        id: order.id,
        invoice_number: `FAC-${order.id.substring(0, 8).toUpperCase()}`,
        client_id: order.client_id
      }));
      
      console.log('Fetched invoices:', transformedData);
      setInvoices(transformedData || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('catalog')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch invoice items when invoice ID changes
  const fetchInvoiceItems = async (invoiceId: string) => {
    try {
      if (!invoiceId || invoiceId === "no_invoice") {
        setInvoiceItems([]);
        return;
      }

      console.log('Fetching invoice items for invoice:', invoiceId);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          product_id,
          product:products(id, name)
        `)
        .eq('order_id', invoiceId);
      
      if (error) throw error;
      
      const items = data.map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || 'Produit inconnu',
        quantity: item.quantity,
        price: item.price
      }));
      
      console.log('Fetched invoice items:', items);
      setInvoiceItems(items);
      
      const initialSelectedItems: {[key: string]: boolean} = {};
      items.forEach(item => {
        initialSelectedItems[item.product_id] = false;
      });
      setSelectedItems(initialSelectedItems);
    } catch (error) {
      console.error('Error fetching invoice items:', error);
    }
  };

  // Filter invoices when client changes
  useEffect(() => {
    if (newReturn.client_id) {
      console.log('Filtering invoices for client:', newReturn.client_id);
      
      const clientInvoices = invoices.filter(invoice => invoice.client_id === newReturn.client_id);
      console.log('Filtered invoices:', clientInvoices);
      
      setFilteredInvoices(clientInvoices);
      
      if (newReturn.invoice_id !== "no_invoice" && !clientInvoices.some(inv => inv.id === newReturn.invoice_id)) {
        setNewReturn(prev => ({
          ...prev,
          invoice_id: ""
        }));
        setInvoiceItems([]);
      }
    } else {
      setFilteredInvoices([]);
      setInvoiceItems([]);
    }
  }, [newReturn.client_id, invoices]);

  // Fetch invoice items when invoice changes
  useEffect(() => {
    if (newReturn.invoice_id) {
      fetchInvoiceItems(newReturn.invoice_id);
    } else {
      setInvoiceItems([]);
    }
  }, [newReturn.invoice_id]);

  // Handle input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReturn(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNewReturn(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'invoice_id') {
      setNewReturn(prev => ({
        ...prev,
        items: []
      }));
    }
  };

  // Handle item checkbox changes
  const handleItemCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: checked
    }));
    
    if (checked) {
      const item = invoiceItems.find(item => item.product_id === productId);
      if (item) {
        setNewReturn(prev => ({
          ...prev,
          items: [...prev.items.filter(i => i.product_id !== productId), {
            product_id: productId,
            quantity: 1
          }]
        }));
      }
    } else {
      setNewReturn(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product_id !== productId)
      }));
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (productId: string, quantity: number) => {
    const invoiceItem = invoiceItems.find(item => item.product_id === productId);
    const maxQuantity = invoiceItem ? invoiceItem.quantity : 1;
    
    const validQuantity = Math.min(Math.max(1, quantity), maxQuantity);
    
    setNewReturn(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: validQuantity } 
          : item
      )
    }));
  };

  // Handle adding manual products
  const handleAddManualProduct = () => {
    setNewReturn(prev => ({
      ...prev,
      items: [...prev.items, {product_id: "", quantity: 1}]
    }));
  };

  // Handle removing manual products
  const handleRemoveManualProduct = (index: number) => {
    setNewReturn(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Handle manual product changes
  const handleManualProductChange = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    setNewReturn(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Get item quantity
  const getItemQuantity = (productId: string) => {
    const item = newReturn.items.find(item => item.product_id === productId);
    return item ? item.quantity : 1;
  };

  // Get invoice item quantity
  const getInvoiceItemQuantity = (productId: string) => {
    const item = invoiceItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  // Submit the new return
  const handleSubmitNewReturn = async () => {
    try {
      if (!newReturn.client_id) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un client",
          variant: "destructive"
        });
        return;
      }

      if (newReturn.items.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner au moins un article à retourner",
          variant: "destructive"
        });
        return;
      }

      let totalAmount = 0;
      for (const item of newReturn.items) {
        const invoiceItem = invoiceItems.find(i => i.product_id === item.product_id);
        if (invoiceItem) {
          totalAmount += invoiceItem.price * item.quantity;
        } else {
          totalAmount += 1000 * item.quantity;
        }
      }
      
      const actualInvoiceId = newReturn.invoice_id === "no_invoice" ? null : newReturn.invoice_id || null;
      console.log('Creating return with invoice_id:', actualInvoiceId);
      
      const { data: returnData, error: returnError } = await supabase
        .from('customer_returns')
        .insert({
          return_number: `RET-${Date.now().toString().substring(6)}`,
          client_id: newReturn.client_id,
          invoice_id: actualInvoiceId,
          return_date: new Date().toISOString(),
          total_amount: totalAmount,
          status: 'pending',
          reason: newReturn.reason,
          notes: newReturn.notes
        })
        .select('id')
        .single();

      if (returnError) {
        console.error('Error creating return:', returnError);
        throw returnError;
      }

      const returnItems = newReturn.items
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => ({
          return_id: returnData.id,
          product_id: item.product_id,
          quantity: Number(item.quantity)
        }));

      if (returnItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('customer_return_items')
          .insert(returnItems);

        if (itemsError) {
          console.error('Error creating return items:', itemsError);
          throw itemsError;
        }
      }

      toast({
        title: "Succès",
        description: "Le retour client a été créé avec succès",
      });

      setNewReturn({
        client_id: "",
        invoice_id: "",
        reason: "",
        notes: "",
        items: []
      });
      setSelectedItems({});
      setInvoiceItems([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le retour client",
        variant: "destructive"
      });
    }
  };

  return {
    clients,
    filteredInvoices,
    invoiceItems,
    products,
    selectedItems,
    newReturn,
    setClients,
    fetchInvoices,
    fetchProducts,
    handleInputChange,
    handleSelectChange,
    handleItemCheckboxChange,
    handleQuantityChange,
    handleAddManualProduct,
    handleRemoveManualProduct,
    handleManualProductChange,
    handleSubmitNewReturn,
    getItemQuantity,
    getInvoiceItemQuantity
  };
}
