
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomerReturn } from "@/types/customer-return";
import { ReturnsList } from "@/components/customer-returns/ReturnsList";
import { NewReturnDialog } from "@/components/customer-returns/NewReturnDialog";

export default function CustomerReturns() {
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewReturnDialogOpen, setIsNewReturnDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch the basic customer returns data
      const { data, error } = await supabase
        .from('customer_returns')
        .select(`
          *,
          client:clients(company_name)
        `);

      if (error) throw error;
      
      // Process the data
      const returnsData = data || [];
      
      // Create an array to hold the fully processed returns
      const processedReturns: CustomerReturn[] = [];
      
      // Process each return separately
      for (const returnItem of returnsData) {
        let invoiceData = null;
        let returnedItems = null;
        
        // Fetch the invoice information if an invoice_id exists
        if (returnItem.invoice_id) {
          const { data: invoiceResult, error: invoiceError } = await supabase
            .from('orders')
            .select('id')
            .eq('id', returnItem.invoice_id)
            .maybeSingle();
            
          if (!invoiceError && invoiceResult) {
            // Generate an invoice number format since it doesn't exist in the orders table
            invoiceData = {
              invoice_number: `FAC-${returnItem.invoice_id.substring(0, 8).toUpperCase()}`
            };
          }
        }
        
        // Fetch the returned items
        const { data: itemsResult, error: itemsError } = await supabase
          .from('customer_return_items')
          .select(`
            quantity,
            product:catalog(name)
          `)
          .eq('return_id', returnItem.id);
          
        if (!itemsError && itemsResult) {
          returnedItems = itemsResult.map((item) => ({
            product_name: item.product?.name || 'Produit inconnu',
            quantity: item.quantity
          }));
        }
        
        // Build the complete return object
        processedReturns.push({
          ...returnItem,
          status: returnItem.status as 'pending' | 'completed' | 'cancelled',
          invoice: invoiceData,
          returned_items: returnedItems
        });
      }
      
      setReturns(processedReturns);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les retours clients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleRefresh = () => {
    fetchReturns();
    toast({
      title: "Actualisé",
      description: "La liste des retours clients a été mise à jour",
    });
  };

  const handleOpenNewReturnDialog = () => {
    setIsNewReturnDialogOpen(true);
  };

  const handleCloseNewReturnDialog = () => {
    setIsNewReturnDialogOpen(false);
  };

  return (
    <div className="p-6">
      <ReturnsList
        returns={returns}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onNewReturn={handleOpenNewReturnDialog}
      />

      <NewReturnDialog
        isOpen={isNewReturnDialogOpen}
        onClose={handleCloseNewReturnDialog}
        onSuccess={fetchReturns}
      />
    </div>
  );
}
